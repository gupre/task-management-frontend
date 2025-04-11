import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {useDispatch, useSelector} from "react-redux";
import { useNavigate } from "react-router-dom";
import {AppDispatch, RootState} from "../../store";

interface AuthFormProps {
    isLogin: boolean;
    onSubmit: (values: any) => Promise<{ token: string }>;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const timezones = useSelector((state: RootState) => state.timeZone.timezones);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: isLogin
            ? {
                email: "",
                password: "",
            }
            : {
                name: "",
                email: "",
                password: "",
                timezoneId: "",
                departmentId: "",
            },
        validationSchema: Yup.object(
            isLogin
                ? {
                    email: Yup.string().email("Некорректный email").required("Обязательное поле"),
                    password: Yup.string().min(6, "Минимум 6 символов").required("Обязательное поле"),
                }
                : {
                    name: Yup.string().required("Обязательное поле"),
                    email: Yup.string().email("Некорректный email").required("Обязательное поле"),
                    password: Yup.string().min(6, "Минимум 6 символов").required("Обязательное поле"),
                    timezoneId: Yup.string().required("Выберите часовой пояс"),
                    departmentId: Yup.string().required("Выберите департамент"),
                }
        ),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await onSubmit(values);
                setLoading(false);
                navigate("/");
            } catch (error) {
                setLoading(false);
                console.error("Ошибка авторизации:", error);
            }
        },
    });

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h5">{isLogin ? "Вход" : "Регистрация"}</Typography>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
                    {!isLogin && (
                        <>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Имя"
                                {...formik.getFieldProps("name")}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </>
                    )}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        type="email"
                        {...formik.getFieldProps("email")}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Пароль"
                        type="password"
                        {...formik.getFieldProps("password")}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    {!isLogin && (
                        <>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Часовой пояс</InputLabel>
                                <Select
                                    label="Часовой пояс"
                                    name="timezoneId"
                                    value={formik.values.timezoneId}
                                    onChange={formik.handleChange}
                                    error={formik.touched.timezoneId && Boolean(formik.errors.timezoneId)}
                                >
                                    {timezones.map((tz) => (
                                        <MenuItem key={tz.id} value={tz.id}>
                                            {tz.name} (UTC{tz.offset >= 0 ? `+${tz.offset}` : tz.offset})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>


                            <FormControl fullWidth margin="normal">
                                <InputLabel>Департамент</InputLabel>
                                <Select
                                    label="Департамент"
                                    name="departmentId"
                                    value={formik.values.departmentId}
                                    onChange={formik.handleChange}
                                    error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
                                >
                                    <MenuItem value={1}>Разработка</MenuItem>
                                    <MenuItem value={2}>Маркетинг</MenuItem>
                                    <MenuItem value={3}>Продажи</MenuItem>
                                    {/* Заменить на реальные данные из БД */}
                                </Select>

                            </FormControl>
                        </>
                    )}

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
                        {loading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default AuthForm;
