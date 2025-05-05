import React from "react";
import AuthForm from "../components/auth/AuthForm";
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import {useNavigate} from "react-router-dom";

const Register: React.FC = () => {
    const navigate = useNavigate();

    const handleRegister = async (values: { email: string; password: string }) => {
        const response = await fetch("http://localhost:4200/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            throw new Error("Ошибка регистрации");
        }

        const data = await response.json();
        return { token: data.token };
    };


    const navigateToLogin = () => {
        navigate("/login");
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
            pt={10}
          >
              <AuthForm isLogin={false} onSubmit={handleRegister} />
              <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={navigateToLogin}
                  >
                      Есть аккаунт? Войти
                  </Button>
              </Box>
          </Box>
      </>
    );
};

export default Register;
