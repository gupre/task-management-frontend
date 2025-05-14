import React, { useState } from 'react'
import AuthForm from "../components/auth/AuthForm";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { Link, useNavigate } from 'react-router-dom'
import { AppBar, Box, Button, IconButton, Snackbar, Toolbar, Typography } from '@mui/material'
import { Person } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

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

            if (response.status === 401 && data.message === "User is not activated") {
                setSnackbarMessage("Пользователь не активирован. Обратитесь к администратору.");
                setSnackbarOpen(true);
                return { token: "" };
            }

            if (data.accessToken) {
                localStorage.setItem("authToken", data.accessToken);
                localStorage.setItem("email", values.email);
                dispatch(login({ email: values.email, token: data.accessToken }));

                navigate("/");

                return { token: data.token };
            } else {
                setSnackbarMessage("Неверный логин или пароль");
                setSnackbarOpen(true);
                return { token: "" };
            }
        } catch (error) {
            console.error("Ошибка при логине:", error);
            setSnackbarMessage("Произошла ошибка. Попробуйте снова.");
            setSnackbarOpen(true);
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
            <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
                <CloseIcon fontSize="small" />
            </IconButton>
        }
      />
    </>);
};

export default Login;
