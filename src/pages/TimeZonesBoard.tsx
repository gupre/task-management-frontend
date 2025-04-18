import React, { useState, useEffect } from "react";
import {
	Box, Typography, Button, Modal, Paper, TextField, Select, MenuItem, InputLabel,
	FormControl, Checkbox, ListItemText, InputAdornment, ListSubheader, Grid, Snackbar, IconButton
} from '@mui/material'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../store';
import { fetchAllUsers } from "../store/userSlice";
import { fetchTimezones, createTimezone, updateTimezone, deleteTimezone } from '../store/timeZoneSlice';
import { Timezone } from "../types";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close'

const TimezonesPage = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { timezones } = useSelector((state: RootState) => state.timeZone);
	const { users } = useSelector((state: RootState) => state.user);

	const [search, setSearch] = useState("");
	const [createSearchUser, setCreateSearchUser] = useState("");
	const [editSearchUser, setEditSearchUser] = useState("");

	const [newTimezoneName, setNewTimezoneName] = useState("");
	const [newTimezoneUsers, setNewTimezoneUsers] = useState<number[]>([]);
	const [newTimezoneOffset, setNewTimezoneOffset] = useState<number>(0);

	const [editingTimezoneId, setEditingTimezoneId] = useState<number | null>(null);
	const [editingTimezoneName, setEditingTimezoneName] = useState<string>("");
	const [editingTimezoneUsers, setEditingTimezoneUsers] = useState<number[]>([]);
	const [editingTimezoneOffset, setEditingTimezoneOffset] = useState<number>(0);

	const [openCreateModal, setOpenCreateModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false)
	const [openReassignModal, setOpenReassignModal] = useState(false);
	const [openSnackbar, setOpenSnackbar] = useState(false);

	const [timezoneToDelete, setTimezoneToDelete] = useState<Timezone | null>(null);
	const [newTimezoneIdForReassign, setNewTimezoneIdForReassign] = useState<number | null>(null);


	useEffect(() => {
		dispatch(fetchTimezones());
		dispatch(fetchAllUsers());
	}, [dispatch]);

	const handleCreateTimezone = async () => {
		await dispatch(createTimezone({ name: newTimezoneName, offset: newTimezoneOffset, users: newTimezoneUsers }));
		await dispatch(fetchTimezones());
		setNewTimezoneName("");
		setNewTimezoneUsers([]);
		setOpenCreateModal(false);
		setOpenSnackbar(true);
	};

	const handleEditTimezone = (timezone: Timezone) => {
		setEditingTimezoneId(timezone.timezoneId);
		setEditingTimezoneName(timezone.name);
		setEditingTimezoneOffset(timezone.offset);
		setEditingTimezoneUsers(timezone.users.map((user) => {
			return user.userId;
		}));
		setOpenEditModal(true);
	};

	const handleUpdateTimezone = async () => {
		if (editingTimezoneId !== null) {
			await dispatch(updateTimezone({
				timezoneId: editingTimezoneId,
				name: editingTimezoneName,
				offset: editingTimezoneOffset,
				users: editingTimezoneUsers
			}));
			await dispatch(fetchTimezones());
			setEditingTimezoneId(null);
			setEditingTimezoneName("");
			setEditingTimezoneUsers([]);
			setOpenEditModal(false);
			setOpenSnackbar(true);
		}
	};

	const handleDeleteTimezone = async (timezoneId: number) => {
		await dispatch(deleteTimezone(timezoneId));
		await dispatch(fetchTimezones());
		setOpenSnackbar(true);
	};

	const handleDeleteClick = (timezone: Timezone) => {
		if (timezone.users.length > 0) {
			setTimezoneToDelete(timezone);
			setOpenReassignModal(true);
		} else {
			handleDeleteTimezone(timezone.timezoneId);
		}
	};

	const handleReassignAndDelete = async () => {
		if (!timezoneToDelete || newTimezoneIdForReassign === null) return;

		const targetTimezone = timezones.find(tz => tz.timezoneId === newTimezoneIdForReassign);
		if (!targetTimezone) return;


		await dispatch(updateTimezone({
			timezoneId: newTimezoneIdForReassign,
			name: targetTimezone.name,
			offset: targetTimezone.offset,
			users: timezoneToDelete.users.map(user => user.userId)
		}));
		await dispatch(deleteTimezone(timezoneToDelete.timezoneId));
		await dispatch(fetchTimezones());
		setOpenReassignModal(false);
		setTimezoneToDelete(null);
		setNewTimezoneIdForReassign(null);
	};

	const filteredTimezones = timezones.filter(tz =>
		tz.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Управление часовыми поясами
			</Typography>

			{/* Поиск и кнопка создания */}
			<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
				<TextField
					variant="outlined"
					size="small"
					fullWidth
					placeholder="Поиск"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
					sx={{ width: "300px" }}
				/>
				<Button
					variant="contained"
					color="primary"
					sx={{ ml: 2 }}
					onClick={() => setOpenCreateModal(true)}
				>
					Создать часовой пояс
				</Button>
			</Box>

			{/* Список часовых поясов */}
			<Box>
				<Grid container spacing={2}>
					{filteredTimezones.map((timezone) => (
						<Grid item xs={12} sm={6} md={4} key={timezone.timezoneId}>
							<Paper
								sx={{
									p: 2,
									borderRadius: 3,
									boxShadow: 3,
									transition: "0.2s ease",
									"&:hover": { boxShadow: 6 },
								}}
							>
								<Typography variant="h6">{timezone.name}</Typography>
								<Box sx={{ mt: 1 }}>
									<Button
										variant="outlined"
										color="primary"
										onClick={() => handleEditTimezone(timezone)}
									>
										Редактировать
									</Button>
									<Button
										variant="outlined"
										color="error"
										sx={{ ml: 2 }}
										onClick={() => handleDeleteClick(timezone)}
									>
										Удалить
									</Button>
								</Box>
							</Paper>
						</Grid>
					))}
				</Grid>
			</Box>


			{/* Модальное окно создания */}
			<Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
				<Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
					<Typography variant="h6" gutterBottom>
						Создать часовой пояс
					</Typography>

					<TextField
						label="Название часового пояса"
						fullWidth
						variant="outlined"
						value={newTimezoneName}
						onChange={(e) => setNewTimezoneName(e.target.value)}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Смещение от UTC"
						fullWidth
						variant="outlined"
						type="number"
						value={newTimezoneOffset}
						onChange={(e) => setNewTimezoneOffset(Number(e.target.value))}
						sx={{ mb: 2 }}
					/>

					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel>Пользователи</InputLabel>
						<Select
							multiple
							value={newTimezoneUsers}
							onChange={(e) => setNewTimezoneUsers(e.target.value as number[])}
							renderValue={(selected) =>
								selected
									.map((userId) => users.find((user) => user.userId === userId)?.name)
									.join(", ")
							}
							MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
						>
							<ListSubheader>
								<TextField
									autoFocus
									placeholder="Поиск..."
									fullWidth
									variant="standard"
									value={createSearchUser}
									onChange={(e) => setCreateSearchUser(e.target.value)}
									onClick={(e) => e.stopPropagation()} // важно: иначе клик закроет меню
								/>
							</ListSubheader>

							{users
								.filter((user) =>
									user.name.toLowerCase().includes(createSearchUser.toLowerCase())
								)
								.map((user) => (
									<MenuItem key={user.userId} value={user.userId}>
										<Checkbox checked={newTimezoneUsers.includes(user.userId)} />
										<ListItemText primary={user.name} />
									</MenuItem>
								))}
						</Select>
					</FormControl>

					<Button variant="contained" color="primary" onClick={handleCreateTimezone}>
						Создать
					</Button>
				</Paper>
			</Modal>

			{/* Модальное окно редактирования */}
			<Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
				<Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
					<Typography variant="h6" gutterBottom>
						Редактировать часовой пояс
					</Typography>

					<TextField
						label="Название часового пояса"
						fullWidth
						variant="outlined"
						value={editingTimezoneName}
						onChange={(e) => setEditingTimezoneName(e.target.value)}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Смещение от UTC (offset)"
						fullWidth
						variant="outlined"
						type="number"
						value={editingTimezoneOffset}
						onChange={(e) => setEditingTimezoneOffset(Number(e.target.value))}
						sx={{ mb: 2 }}
					/>


					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel>Пользователи</InputLabel>
						<Select
							multiple
							value={editingTimezoneUsers}
							onChange={(e) => setEditingTimezoneUsers(e.target.value as number[])}
							renderValue={(selected) => {
								return selected
									.map((userId) => users.find((u) => u.userId === userId)?.name || `#${userId}`)
									.join(", ");
							}}
							MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
						>
							<ListSubheader>
								<TextField
									autoFocus
									placeholder="Поиск..."
									fullWidth
									variant="standard"
									value={editSearchUser}
									onChange={(e) => setEditSearchUser(e.target.value)}
									onClick={(e) => e.stopPropagation()}
								/>
							</ListSubheader>

							{users
								.filter((user) =>
									user.name.toLowerCase().includes(editSearchUser.toLowerCase())
								)
								.map((user) => (
									<MenuItem key={user.userId} value={user.userId}>
										<Checkbox checked={editingTimezoneUsers.includes(user.userId)} />
										<ListItemText primary={user.name} />
									</MenuItem>
								))}
						</Select>
					</FormControl>

					<Button variant="contained" color="primary" onClick={handleUpdateTimezone}>
						Сохранить изменения
					</Button>
				</Paper>
			</Modal>

			<Modal open={openReassignModal} onClose={() => setOpenReassignModal(false)}>
				<Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
					<Typography variant="h6" gutterBottom>
						Нельзя удалить часовой пояс
					</Typography>
					<Typography variant="body1" sx={{ mb: 2 }}>
						К этому часовому поясу привязаны пользователи. Пожалуйста, выберите новый часовой пояс для них перед удалением.
					</Typography>

					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel>Новый часовой пояс</InputLabel>
						<Select
							value={newTimezoneIdForReassign}
							onChange={(e) => setNewTimezoneIdForReassign(Number(e.target.value))}
						>
							{timezones
								.filter(tz => tz.timezoneId !== timezoneToDelete?.timezoneId)
								.map(tz => (
									<MenuItem key={tz.timezoneId} value={tz.timezoneId}>
										{tz.name}
									</MenuItem>
								))}
						</Select>
					</FormControl>

					<Button
						variant="contained"
						color="primary"
						onClick={handleReassignAndDelete}
						disabled={newTimezoneIdForReassign === null}
					>
						Переназначить и удалить
					</Button>
				</Paper>
			</Modal>

			{/* Snackbar для отображения успешных действий */}
			<Snackbar
				open={openSnackbar}
				autoHideDuration={3000}
				onClose={() => setOpenSnackbar(false)}
				message="Операция выполнена успешно"
				action={
					<IconButton size="small" color="inherit" onClick={() => setOpenSnackbar(false)}>
						<CloseIcon fontSize="small" />
					</IconButton>
				}
			/>

		</Box>
	);
};

export default TimezonesPage;
