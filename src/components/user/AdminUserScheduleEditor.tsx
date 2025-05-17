import React, { useState, useEffect } from 'react';
import {
	Grid, TextField, Chip, Paper, Button, FormControl,
	InputLabel, Select, MenuItem, Typography, Switch,
	Snackbar, Alert, Divider
} from '@mui/material';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import DeleteIcon from '@mui/icons-material/Delete';

import { User } from '../../types';

const todayStr = dayjs().format("YYYY-MM-DD");
dayjs.extend(isBetween);

export const typeLabels = {
	vacation: 'Отпуск',
	sick: 'Больничный',
	urgent: 'Форс-мажор'
} as const;

export const typeColors = {
	vacation: 'primary',
	sick: 'warning',
	urgent: 'error'
} as const;

const isUserUnavailableToday = (periods: any[]) =>
	periods?.some(p => {
		const start = dayjs(p.start);
		const end = p.end ? dayjs(p.end) : start;
		return dayjs().isBetween(start, end, null, "[]") && p.active;
	});

export const AdminUserScheduleEditor = ({ user, onChange }: {
	user: User;
	onChange: (update: Partial<User>) => void;
}) => {
	const [workingStart, setWorkingStart] = useState(user.workingHours?.start || "");
	const [workingEnd, setWorkingEnd] = useState(user.workingHours?.end || "");
	const [unavailabilityPeriods, setUnavailabilityPeriods] = useState(user.unavailabilityPeriods || []);
	const [newType, setNewType] = useState<"vacation" | "sick" | "urgent">("vacation");
	const [newStart, setNewStart] = useState("");
	const [newEnd, setNewEnd] = useState("");

	console.log("user", user)
	console.log("unavailabilityPeriods", unavailabilityPeriods)
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");

	const handleAddPeriod = () => {
		if (!newStart) return;
		const start = dayjs(newStart);
		const end = newEnd ? dayjs(newEnd) : start;

		const hasOverlap = unavailabilityPeriods.some(p => {
			if (p.type !== newType) return false;
			const existingStart = dayjs(p.start);
			const existingEnd = p.end ? dayjs(p.end) : existingStart;
			return start.isBetween(existingStart, existingEnd, null, '[]') ||
				end.isBetween(existingStart, existingEnd, null, '[]') ||
				existingStart.isBetween(start, end, null, '[]');
		});

		if (hasOverlap) {
			setSnackbarMessage("Период этого типа пересекается с существующим.");
			setSnackbarOpen(true);
			return;
		}

		const newPeriod = {
			type: newType,
			start: newStart,
			end: newEnd || undefined,
			active: !newEnd || dayjs(newEnd).isAfter(todayStr)
		};

		setUnavailabilityPeriods([...unavailabilityPeriods, newPeriod]);
		setNewStart("");
		setNewEnd("");
	};

	const handleDeletePeriod = (index: number) => {
		const updated = [...unavailabilityPeriods];
		updated.splice(index, 1);
		setUnavailabilityPeriods(updated);
	};

	const handleToggleAvailability = () => {
		const todayUnavailable = isUserUnavailableToday(unavailabilityPeriods);
		if (todayUnavailable) {
			const updated = unavailabilityPeriods.map(p => {
				const start = dayjs(p.start);
				const end = p.end ? dayjs(p.end) : start;
				const isToday = dayjs().isBetween(start, end, null, "[]");
				return isToday ? { ...p, active: false } : p;
			});
			setUnavailabilityPeriods(updated);
		} else {
			setUnavailabilityPeriods([...unavailabilityPeriods, {
				type: 'urgent',
				start: todayStr,
				end: todayStr,
				active: true
			}]);
		}
	};

	useEffect(() => {
		const originalWorkingStart = user.workingHours?.start || "";
		const originalWorkingEnd = user.workingHours?.end || "";
		const originalUnavailable = user.unavailabilityPeriods || [];

		const isWorkingHoursChanged = workingStart !== originalWorkingStart || workingEnd !== originalWorkingEnd;
		const isUnavailableChanged =
			JSON.stringify([...unavailabilityPeriods].sort()) !==
			JSON.stringify([...originalUnavailable].sort());

		if (isWorkingHoursChanged || isUnavailableChanged) {
			// Удалим лишние поля
			const cleanedPeriods = unavailabilityPeriods.map(({ type, start, end, active }) => ({
				type,
				start,
				end,
				active,
			}));


			onChange({
				workingHours: { start: workingStart, end: workingEnd },
				unavailabilityPeriods: cleanedPeriods
			});
		}
	}, [workingStart, workingEnd, unavailabilityPeriods]);

	return (
		<Grid container spacing={3} sx={{ p: 3 }}>
			<Grid item xs={12} sm={6}>
				<Typography variant="h6">Рабочие часы</Typography>
				<Grid container spacing={2} sx={{ mt: 1 }}>
					<Grid item xs={6}>
						<TextField
							label="Начало"
							type="time"
							value={workingStart}
							onChange={(e) => setWorkingStart(e.target.value)}
							fullWidth
						/>
					</Grid>
					<Grid item xs={6}>
						<TextField
							label="Окончание"
							type="time"
							value={workingEnd}
							onChange={(e) => setWorkingEnd(e.target.value)}
							fullWidth
						/>
					</Grid>
				</Grid>

				<Divider sx={{ my: 2 }} />

				<Typography>Доступен сегодня</Typography>
				<Switch
					checked={!isUserUnavailableToday(unavailabilityPeriods)}
					onChange={handleToggleAvailability}
				/>

				<Divider sx={{ my: 2 }} />

				<Typography variant="h6">Добавить недоступность</Typography>
				<FormControl fullWidth sx={{ mt: 1 }}>
					<InputLabel>Тип недоступности</InputLabel>
					<Select
						value={newType}
						onChange={(e) => setNewType(e.target.value as any)}
						label="Тип недоступности"
					>
						<MenuItem value="vacation">Отпуск</MenuItem>
						<MenuItem value="sick">Больничный</MenuItem>
						<MenuItem value="urgent">Форс-мажор</MenuItem>
					</Select>
				</FormControl>

				<Grid container spacing={2} sx={{ mt: 1 }}>
					<Grid item xs={6}>
						<TextField
							label="Дата начала"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={newStart}
							onChange={(e) => setNewStart(e.target.value)}
							fullWidth
						/>
					</Grid>
					<Grid item xs={6}>
						<TextField
							label="Дата окончания"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={newEnd}
							onChange={(e) => setNewEnd(e.target.value)}
							fullWidth
						/>
					</Grid>
				</Grid>

				<Button
					variant="contained"
					onClick={handleAddPeriod}
					sx={{ mt: 2 }}
				>
					Добавить период
				</Button>
			</Grid>

			<Grid item xs={12} sm={6}>
				<Typography variant="h6">Периоды недоступности</Typography>
				<Paper variant="outlined" sx={{ maxHeight: 350, overflowY: "auto", mt: 1, p: 1 }}>
					{unavailabilityPeriods.length === 0 ? (
						<Typography variant="body2" color="text.secondary">Нет периодов</Typography>
					) : (
						unavailabilityPeriods.map((p, index) => (
							<Chip
								key={index}
								sx={{ mr: 1, mb: 1 }}
								color={typeColors[p.type]}
								variant={p.active ? "filled" : "outlined"}
								label={`${typeLabels[p.type]}: ${dayjs(p.start).format('DD.MM.YY')}${p.end && p.end !== p.start ? ` – ${dayjs(p.end).format('DD.MM.YY')}` : ""}${p.active === false ? " (неактивен)" : ""}`}
								onDelete={() => handleDeletePeriod(index)}
								deleteIcon={<DeleteIcon />}
							/>
						))
					)}
				</Paper>
			</Grid>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={4000}
				onClose={() => setSnackbarOpen(false)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity="error" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</Grid>
	);
};
