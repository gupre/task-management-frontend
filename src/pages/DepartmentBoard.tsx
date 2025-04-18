import React, { useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	Modal,
	Paper,
	TextField,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	Checkbox,
	ListItemText,
	Snackbar,
	IconButton,
	InputAdornment,
	ListSubheader,
	Grid
} from '@mui/material'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../store';
import { fetchAllUsers } from "../store/userSlice";
import { fetchAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../store/departmentSlice";
import { Department} from '../types'
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

const DepartmentsPage = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { departments } = useSelector((state: RootState) => state.department);
	const { users } = useSelector((state: RootState) => state.user);

	const [search, setSearch] = useState("");
	const [createSearchUser, setCreateSearchUser] = useState("");
	const [editSearchUser, setEditSearchUser] = useState("");

	const [newDepartmentName, setNewDepartmentName] = useState("");
	const [newDepartmentUsers, setNewDepartmentUsers] = useState<number[]>([]);

	const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
	const [editingDepartmentName, setEditingDepartmentName] = useState("");
	const [editingDepartmentUsers, setEditingDepartmentUsers] = useState<number[]>([]);

	const [openCreateModal, setOpenCreateModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openReassignModal, setOpenReassignModal] = useState(false);
	const [openSnackbar, setOpenSnackbar] = useState(false);

	const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
	const [newDepartmentIdForReassign, setNewDepartmentIdForReassign] = useState<number | null>(null);

	useEffect(() => {
		dispatch(fetchAllDepartments());
		dispatch(fetchAllUsers());
	}, [dispatch]);

	const handleCreateDepartment = async ()  => {
		await dispatch(createDepartment({ name: newDepartmentName, users: newDepartmentUsers }));
		await dispatch(fetchAllDepartments());
		setNewDepartmentName("");
		setNewDepartmentUsers([]);
		setOpenCreateModal(false);
		setOpenSnackbar(true);
	};

	const handleEditDepartment = (department: Department) => {
		setEditingDepartmentId(department.departmentId);
		setEditingDepartmentName(department.name);
		setEditingDepartmentUsers(department.users.map((user) => user.userId));
		setOpenEditModal(true);
	};

	const handleUpdateDepartment = async  () => {
		if (editingDepartmentId !== null) {
			await  dispatch(updateDepartment({ departmentId: editingDepartmentId, name: editingDepartmentName, users: editingDepartmentUsers }));
			await dispatch(fetchAllDepartments());
			setEditingDepartmentId(null);
			setEditingDepartmentName("");
			setEditingDepartmentUsers([]);
			setOpenEditModal(false);
			setOpenSnackbar(true);
		}
	};

	const handleDeleteDepartment = async (departmentId: number) => {
		await dispatch(deleteDepartment(departmentId));
		await dispatch(fetchAllDepartments());
		setOpenSnackbar(true);
	};

	const handleDeleteClick = (department: Department) => {
		if (department.users.length > 0) {
			setDepartmentToDelete(department);
			setOpenReassignModal(true);
		} else {
			handleDeleteDepartment(department.departmentId);
		}
	};

	const handleReassignAndDelete = async () => {
		if (!departmentToDelete || newDepartmentIdForReassign === null) return;

		const targetDepartment = departments.find(department => department.departmentId === newDepartmentIdForReassign);
		if (!targetDepartment) return;


		await dispatch(updateDepartment({
			departmentId: newDepartmentIdForReassign,
			name: targetDepartment.name,
			users: departmentToDelete.users.map(user => user.userId)
		}));

		await dispatch(deleteDepartment(departmentToDelete.departmentId));
		await dispatch(fetchAllDepartments());

		setOpenReassignModal(false);
		setDepartmentToDelete(null);
		setNewDepartmentIdForReassign(null);
	};

	const filteredDepartments = departments.filter(department =>
		department.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h6" gutterBottom>
				Управление департаментами
			</Typography>

			{/* Поиск с иконкой лупы слева */}
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
				{/* Кнопка "Создать департамент" справа от поиска */}
				<Button
					variant="contained"
					color="primary"
					sx={{ ml: 2 }}
					onClick={() => setOpenCreateModal(true)}
				>
					Создать департамент
				</Button>
			</Box>

			<Box>
				<Grid container spacing={2}>
					{filteredDepartments.map((department) => (
						<Grid item xs={12} sm={6} md={4} key={department.departmentId}>
							<Paper key={department.departmentId}
								 sx={{
										p: 2,
										mb: 2,
										borderRadius: 3,
										boxShadow: 3,
										transition: "0.2s ease",
										"&:hover": { boxShadow: 6 },
								 }}
								>
								<Typography variant="h6">{department.name}</Typography>
								<Box sx={{ mt: 1 }}>
									<Button variant="outlined" color="primary" onClick={() => handleEditDepartment(department)}>
										Редактировать
									</Button>
									<Button
										variant="outlined"
										color="error"
										sx={{ ml: 2 }}
										onClick={() => handleDeleteClick(department)}
									>
										Удалить
									</Button>
								</Box>
							</Paper>
						</Grid>
					))}
				</Grid>
			</Box>

			{/* Модальное окно для создания департамента */}
			<Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
				<Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
					<Typography variant="h6" gutterBottom>
						Создать департамент
					</Typography>

					<TextField
						label="Название департамента"
						variant="outlined"
						fullWidth
						value={newDepartmentName}
						onChange={(e) => setNewDepartmentName(e.target.value)}
						sx={{ mb: 2 }}
					/>

					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel>Пользователи</InputLabel>
						<Select
							multiple
							value={newDepartmentUsers}
							onChange={(e) => setNewDepartmentUsers(e.target.value as number[])}
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
										<Checkbox checked={newDepartmentUsers.includes(user.userId)} />
										<ListItemText primary={user.name} />
									</MenuItem>
								))}
						</Select>
					</FormControl>


					<Button variant="contained" color="primary" onClick={handleCreateDepartment}>
						Создать
					</Button>
				</Paper>
			</Modal>

			{/* Модальное окно для редактирования департамента */}
			<Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
				<Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
					<Typography variant="h6" gutterBottom>
						Редактировать департамент
					</Typography>
					<TextField
						label="Название департамента"
						variant="outlined"
						fullWidth
						value={editingDepartmentName}
						onChange={(e) => setEditingDepartmentName(e.target.value)}
						sx={{ mb: 2 }}
					/>

					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel>Пользователи</InputLabel>
						<Select
							multiple
							value={editingDepartmentUsers}
							onChange={(e) => setEditingDepartmentUsers(e.target.value as number[])}
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
										<Checkbox checked={editingDepartmentUsers.includes(user.userId)} />
										<ListItemText primary={user.name} />
									</MenuItem>
								))}
						</Select>
					</FormControl>


					<Button variant="contained" color="primary" onClick={handleUpdateDepartment}>
						Сохранить изменения
					</Button>
				</Paper>
			</Modal>

			<Modal open={openReassignModal} onClose={() => setOpenReassignModal(false)}>
				<Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
					<Typography variant="h6" gutterBottom>
						Нельзя удалить департамент
					</Typography>
					<Typography variant="body1" sx={{ mb: 2 }}>
						К этому департаменту привязаны пользователи. Пожалуйста, выберите новый департамент для них перед удалением.
					</Typography>

					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel>Новый департамент</InputLabel>
						<Select
							value={newDepartmentIdForReassign}
							onChange={(e) => setNewDepartmentIdForReassign(Number(e.target.value))}
						>
							{departments
								.filter(department => department.departmentId !== departmentToDelete?.departmentId)
								.map(department => (
									<MenuItem key={department.departmentId} value={department.departmentId}>
										{department.name}
									</MenuItem>
								))}
						</Select>
					</FormControl>

					<Button
						variant="contained"
						color="primary"
						onClick={handleReassignAndDelete}
						disabled={newDepartmentIdForReassign === null}
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

export default DepartmentsPage;
