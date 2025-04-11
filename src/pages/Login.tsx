import React from "react";
import AuthForm from "../components/auth/AuthForm";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (values: { email: string; password: string }) => {
        try {
            const response = await fetch("http://localhost:4200/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (data.accessToken) {
                localStorage.setItem("authToken", data.accessToken);
                dispatch(login({ email: values.email, token: data.accessToken }));

                navigate("/");

                return { token: data.token };
            } else {
                alert("Неверный логин или пароль");
                return { token: "" };
            }
        } catch (error) {
            console.error("Ошибка при логине:", error);
            alert("Произошла ошибка. Попробуйте снова.");
            return { token: "" };
        }
    };

    const navigateToRegister = () => {
        navigate("/register");
    };

    return (<>
            <AuthForm isLogin={true} onSubmit={handleLogin} />
            <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={navigateToRegister}
            >
                Нет аккаунта? Зарегистрироваться
            </Button>
            </>);
};

export default Login;
