import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute: React.FC = () => {
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
        // Если токен отсутствует, редиректим на страницу логина
        return <Navigate to="/login" />;
    }

    // Если токен есть, показываем защищённый контент
    return <Outlet />;
};

export default PrivateRoute;
