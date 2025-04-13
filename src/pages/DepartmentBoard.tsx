import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../store/departmentSlice";
import { AppDispatch, RootState } from '../store'
import { Department } from "../types";

const DepartmentsPage = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { departments, loading, error } = useSelector((state: RootState) => state.department);

	const [newDepartmentName, setNewDepartmentName] = useState("");
	const [newDepartmentUsers, setNewDepartmentUsers] = useState<number[]>([]);
	const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
	const [editingDepartmentName, setEditingDepartmentName] = useState("");
	const [editingDepartmentUsers, setEditingDepartmentUsers] = useState<number[]>([]);

	useEffect(() => {
		dispatch(fetchAllDepartments());
	}, [dispatch]);

	const handleCreateDepartment = (e: React.FormEvent) => {
		e.preventDefault();
		dispatch(createDepartment({ name: newDepartmentName, users: newDepartmentUsers }));
		setNewDepartmentName("");
		setNewDepartmentUsers([]);
	};

	const handleEditDepartment = (department: Department) => {
		setEditingDepartmentId(department.departmentId);
		setEditingDepartmentName(department.name);
		setEditingDepartmentUsers(department.users.map((user) => user.userId));
	};

	const handleUpdateDepartment = (e: React.FormEvent) => {
		e.preventDefault();
		if (editingDepartmentId !== null) {
			dispatch(updateDepartment({ departmentId: editingDepartmentId, name: editingDepartmentName, users: editingDepartmentUsers }));
			setEditingDepartmentId(null);
			setEditingDepartmentName("");
			setEditingDepartmentUsers([]);
		}
	};

	const handleDeleteDepartment = (departmentId: number) => {
		dispatch(deleteDepartment(departmentId));
	};

	if (loading) return <p>Загрузка...</p>;
	if (error) return <p>Ошибка: {error}</p>;

	return (
		<div>
			<h2>Департаменты</h2>

			{/* Форма для создания департамента */}
			<form onSubmit={handleCreateDepartment}>
				<h3>Создать департамент</h3>
				<div>
					<label>Название департамента</label>
					<input
						type="text"
						value={newDepartmentName}
						onChange={(e) => setNewDepartmentName(e.target.value)}
						required
					/>
				</div>
				<div>
					<label>Пользователи (ID через запятую)</label>
					<input
						type="text"
						value={newDepartmentUsers.join(",")}
						onChange={(e) => setNewDepartmentUsers(e.target.value.split(",").map((id) => parseInt(id.trim(), 10)))}
					/>
				</div>
				<button type="submit">Создать</button>
			</form>

			{/* Форма для редактирования департамента */}
			{editingDepartmentId !== null && (
				<form onSubmit={handleUpdateDepartment}>
					<h3>Редактировать департамент</h3>
					<div>
						<label>Название департамента</label>
						<input
							type="text"
							value={editingDepartmentName}
							onChange={(e) => setEditingDepartmentName(e.target.value)}
							required
						/>
					</div>
					<div>
						<label>Пользователи (ID через запятую)</label>
						<input
							type="text"
							value={editingDepartmentUsers.join(",")}
							onChange={(e) => setEditingDepartmentUsers(e.target.value.split(",").map((id) => parseInt(id.trim(), 10)))}
						/>
					</div>
					<button type="submit">Сохранить изменения</button>
				</form>
			)}

			{/* Список департаментов */}
			<h3>Список департаментов</h3>
			<ul>
				{departments.map((department) => (
					<li key={department.departmentId}>
						<span>{department.name}</span>
						<button onClick={() => handleEditDepartment(department)}>Редактировать</button>
						<button onClick={() => handleDeleteDepartment(department.departmentId)}>Удалить</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default DepartmentsPage;
