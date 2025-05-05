import React from "react";
import AuthForm from "../components/auth/AuthForm";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { Link, useNavigate } from 'react-router-dom'
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material'
import { Person } from '@mui/icons-material'

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

    return (
      <>
        <AppBar position="fixed" sx={{ width: "100%" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
                >
                    Task Manager
                </Typography>
            </Toolbar>
        </AppBar>

        <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px={2}
        pt={20}
        >
          <AuthForm isLogin={true} onSubmit={handleLogin} />
          <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={navigateToRegister}
              >
                  Нет аккаунта? Зарегистрироваться
              </Button>
          </Box>
        </Box>
    </>);
};

export default Login;
