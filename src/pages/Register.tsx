import React from "react";
import AuthForm from "../components/auth/AuthForm";
import {Button} from "@mui/material";
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

    return (<>
        <AuthForm isLogin={false} onSubmit={handleRegister} />
        <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={navigateToLogin}
        >
            Есть аккаунт? Войти
        </Button>
    </>);
};

export default Register;
