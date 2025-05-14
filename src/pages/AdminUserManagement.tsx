import React, { useEffect, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Select,
	MenuItem,
	Checkbox,
	Typography,
	Button,
	TextField,
	InputAdornment,
	Pagination,
	Dialog,
	DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { AppDispatch } from '../store';
import { assignUserDepartment, changeUserActive, changeUserRole, fetchAllUsers } from '../store/userSlice'
import { fetchAllDepartments } from "../store/departmentSlice";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { AdminUserScheduleEditor } from "../components/user/AdminUserScheduleEditor";

const AdminUserManagement: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const users = useSelector((state: RootState) => state.user.users);
	const departments = useSelector((state: RootState) => state.department.departments);

	const [editedUsers, setEditedUsers] = useState<Record<string, any>>({});
	const [search, setSearch] = useState("");
	const [filterDepartment, setFilterDepartment] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [openUserId, setOpenUserId] = useState<number | null>(null);

	const usersPerPage = 10;

	useEffect(() => {
		dispatch(fetchAllUsers());
		dispatch(fetchAllDepartments());
	}, [editedUsers]);

	const handleChange = (userId: number, field: string, value: any) => {
		setEditedUsers((prev) => ({
			...prev,
			[userId]: {
				...prev[userId],
				[field]: value
			}
		}));
	};

	const handleSave = (userId: number) => {
		const changes = editedUsers[userId];
		if (!changes) return;

		const original = users.find(u => u.userId === userId);
		if (!original) return;

		if ('departmentId' in changes && changes.departmentId !== original.departmentId) {
			dispatch(assignUserDepartment({ userId, departmentId: changes.departmentId }));
		}
		if ('isActive' in changes && changes.isActive !== original.isActive) {
			dispatch(changeUserActive({ userId, isActive: changes.isActive }));
		}
		if ('isAdmin' in changes && changes.isAdmin !== original.isAdmin) {
			dispatch(changeUserRole({ userId, isAdmin: changes.isAdmin }));
		}


		setEditedUsers((prev) => {
			const newState = { ...prev };
			delete newState[userId];
			return newState;
		});
	};

	const handleSaveAll = () => {
		Object.keys(editedUsers).forEach((id) => handleSave(Number(id)));
	};

	const filteredUsers = users
		.filter(u => (!search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase())))
		.filter(u => (!filterDepartment || u.departmentId === Number(filterDepartment)))


	const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
	const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

	return (
		<Paper sx={{ p: 2 }}>
			<Typography variant="h4" mb={3} fontWeight={600} gutterBottom>Управление пользователями</Typography>

			<div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
			<TextField
				variant="outlined"
				size="small"
				placeholder="Поиск по имени или email"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon />
						</InputAdornment>
					)
				}}
			/>
			<Select
				value={filterDepartment}
				onChange={(e) => setFilterDepartment(e.target.value)}
				displayEmpty
				size="small"
			>
				<MenuItem value="">Все департаменты</MenuItem>
				{departments.map(dep => (
					<MenuItem key={dep.departmentId} value={dep.departmentId}>{dep.name}</MenuItem>
				))}
			</Select>
			<Button
				variant="contained"
				onClick={handleSaveAll}
				disabled={Object.keys(editedUsers).length === 0}
			>
				Сохранить все изменения
			</Button>
			<Button
				variant="outlined"
				color="secondary"
				onClick={() => setEditedUsers({})}
				disabled={Object.keys(editedUsers).length === 0}
			>
				Отменить изменения
			</Button>
		</div>


	<TableContainer>
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Email</TableCell>
					<TableCell>Имя</TableCell>
					<TableCell>Департамент</TableCell>
					<TableCell>Активен</TableCell>
					<TableCell>Администратор</TableCell>
					<TableCell>Рабочее время и выходные</TableCell>
					<TableCell>Сохранить</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{paginatedUsers.map((user) => {
					const changes = editedUsers[user.userId] || {}
					const isEdited = !!editedUsers[user.userId]
					return (
						<TableRow key={user.userId} sx={{ backgroundColor: isEdited ? '#fff9e1' : 'inherit' }}>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.name}</TableCell>
							<TableCell>
								<TextField
									select
									size="small"
									variant="outlined"
									value={changes.departmentId ?? user.departmentId ?? ''}
									onChange={(e) => handleChange(user.userId, 'departmentId', e.target.value)}
									InputProps={{
										startAdornment: isEdited ? (
											<InputAdornment position="start">
												<EditIcon fontSize="small" color="warning" />
											</InputAdornment>
										) : null
									}}
									fullWidth
								>
									<MenuItem value="">—</MenuItem>
									{departments.map((dep) => (
										<MenuItem key={dep.departmentId} value={dep.departmentId}>
											{dep.name}
										</MenuItem>
									))}
								</TextField>

							</TableCell>
							<TableCell>
								<Checkbox
									checked={changes.isActive ?? user.isActive}
									onChange={(e) => handleChange(user.userId, "isActive", e.target.checked)}
									color={isEdited ? "warning" : "primary"}
								/>
							</TableCell>
							<TableCell>
								<Checkbox
									checked={changes.isAdmin ?? user.isAdmin}
									onChange={(e) => handleChange(user.userId, "isAdmin", e.target.checked)}
									color={isEdited ? "warning" : "primary"}
								/>
							</TableCell>


							<TableCell>
								<Button
									variant="outlined"
									size="small"
									onClick={() => setOpenUserId(user.userId)}
									startIcon={<EditIcon />}
								>
									Редактировать
								</Button>

								{/* Модалка с графиком */}
								<Dialog
									open={openUserId === user.userId}
									onClose={() => setOpenUserId(null)}
									fullWidth
									maxWidth="md"
								>
									<DialogTitle>Редактирование графика: {user.name}</DialogTitle>
									<DialogContent>

										<AdminUserScheduleEditor
											user={user}
											onChange={(update) => {
												setEditedUsers((prev) => ({
													...prev,
													[user.userId]: {
														...prev[user.userId],
														...update,
													},
												}));
											}}
										/>
									</DialogContent>
									<DialogActions>
										<Button onClick={() => setOpenUserId(null)}>Закрыть</Button>
									</DialogActions>
								</Dialog>
							</TableCell>


							<TableCell>
										<Button
											variant="contained"
											size="small"
											onClick={() => handleSave(user.userId)}
											disabled={!isEdited}
										>
											Сохранить
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
			{totalPages > 1 && (
				<Pagination
					count={totalPages}
					page={currentPage}
					onChange={(_, value) => setCurrentPage(value)}
					sx={{ mt: 2 }}
				/>
			)}
		</Paper>
	);
};

export default AdminUserManagement;
