import React, { useState, useEffect } from 'react';
import { Stack, TextField, Chip, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../../types';

export const AdminUserScheduleEditor = ({ user, onChange }: {
	user: User;
	onChange: (update: Partial<User>) => void;
}) => {
	const [workingStart, setWorkingStart] = useState(user.workingHours?.start || "");
	const [workingEnd, setWorkingEnd] = useState(user.workingHours?.end || "");
	const [unavailableDates, setUnavailableDates] = useState(user.unavailableDates || []);

	useEffect(() => {
		const originalWorkingStart = user.workingHours?.start || "";
		const originalWorkingEnd = user.workingHours?.end || "";
		const originalUnavailable = user.unavailableDates || [];

		const isWorkingHoursChanged = workingStart !== originalWorkingStart || workingEnd !== originalWorkingEnd;
		const isUnavailableChanged =
			JSON.stringify([...unavailableDates].sort()) !==
			JSON.stringify([...originalUnavailable].sort());

		if (isWorkingHoursChanged || isUnavailableChanged) {
			onChange({
				workingHours: { start: workingStart, end: workingEnd },
				unavailableDates
			});
		}
	}, [workingStart, workingEnd, unavailableDates]);


	const groupConsecutiveDates = (dates: string[]) => {
		if (!dates.length) return [];
		const sorted = [...dates].sort();
		const result: string[] = [];
		let rangeStart = sorted[0];
		let prev = dayjs(sorted[0]);

		for (let i = 1; i <= sorted.length; i++) {
			const current = dayjs(sorted[i]);
			if (!current.isSame(prev.add(1, 'day'), 'day')) {
				if (rangeStart !== sorted[i - 1]) {
					result.push(`${rangeStart} — ${sorted[i - 1]}`);
				} else {
					result.push(rangeStart);
				}
				rangeStart = sorted[i];
			}
			prev = current;
		}

		return result;
	};

	return (
		<Stack spacing={2}  sx={{ p: 1 }}>
			<TextField
				label="Начало дня"
				value={workingStart}
				onChange={(e) => setWorkingStart(e.target.value)}
				fullWidth
			/>
			<TextField
				label="Окончание дня"
				value={workingEnd}
				onChange={(e) => setWorkingEnd(e.target.value)}
				fullWidth
			/>
			<TextField
				label="Добавить дату отпуска"
				type="date"
				InputLabelProps={{ shrink: true }}
				fullWidth
				onChange={(e) => {
					const formatted = dayjs(e.target.value).format('YYYY-MM-DD');
					if (!unavailableDates.includes(formatted)) {
						setUnavailableDates([...unavailableDates, formatted]);
					}
				}}
			/>
			<Paper variant="outlined" sx={{ maxHeight: 150, overflowY: 'auto', p: 1 }}>
				<Stack direction="row" flexWrap="wrap" gap={1}>
					{groupConsecutiveDates(unavailableDates).map((label, index) => (
						<Chip
							key={index}
							label={label}
							onDelete={() =>
								setUnavailableDates(
									unavailableDates.filter((d) => !label.includes(d))
								)
							}
							deleteIcon={<DeleteIcon />}
						/>
					))}
				</Stack>
			</Paper>
		</Stack>
	);
};
