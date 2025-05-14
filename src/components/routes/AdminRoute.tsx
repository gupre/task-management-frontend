import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const AdminRoute = () => {
	const email = useSelector((state: RootState) => state.auth.user?.email)  || localStorage.getItem('email');
	const token = useSelector((state: RootState) => state.auth.token);

	const [isLoading, setIsLoading] = useState(true);
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

	useEffect(() => {
		const fetchUserRole = async () => {
			try {
				const res = await fetch(`http://localhost:4200/api/users/email/${email}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) throw new Error('Ошибка при получении данных пользователя');

				const userData = await res.json();

				// Учитываем, что у администратора roleId === 1
				setIsAdmin(userData.roleId === 1);
			} catch (error) {
				console.error(error);
				setIsAdmin(false); // если ошибка — не пускаем
			} finally {
				setIsLoading(false);
			}
		};

		if (email && token) {
			fetchUserRole();
		} else {
			setIsAdmin(false);
			setIsLoading(false);
		}
	}, [email, token]);

	if (isLoading) return <div>Загрузка...</div>;

	if (!isAdmin) return <Navigate to="/" replace />;

	return <Outlet />;
};

export default AdminRoute;