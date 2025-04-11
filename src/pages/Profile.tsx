import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
    fetchUserProfile,
    updateUserProfile,
    changePassword,
} from "../store/userSlice";
import {
    fetchTimezones,
    updateUserTimezone,
} from "../store/timeZoneSlice";
import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    FormControlLabel,
    Checkbox,
} from "@mui/material";

const UserProfile: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.user);
    const timezones = useSelector((state: RootState) => state.timeZone.timezones);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [timezone, setTimezone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [departmentId, setDepartmentId] = useState<number | "">("");
    const [roleId, setRoleId] = useState<number | "">("");
    const [isActive, setIsActive] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(fetchTimezones());
    }, [dispatch]);

    useEffect(() => {
        const profile = user.profile;
        if (profile && timezones.length > 0) {
            setName(profile.name || "");
            setEmail(profile.email || "");
            setDepartmentId(profile.departmentId ?? "");
            setRoleId(profile.roleId ?? "");
            setIsActive(profile.isActive ?? false);
            setIsAdmin(profile.isAdmin ?? false);

            const matched = timezones.find(
                (tz) => tz.id === Number(profile?.timezoneId)
            );
            setTimezone(matched?.name || "");
        }
    }, [user.profile, timezones]);

    const handleSave = () => {
        dispatch(updateUserProfile({
            name,
            email,
            departmentId: departmentId === "" ? undefined : Number(departmentId),
            roleId: roleId === "" ? undefined : Number(roleId),
            isActive,
            isAdmin,
        }));
        handleTimezoneChange();
    };

    const handleChangePassword = () => {
        if (!password || !confirmPassword) {
            setPasswordError("Заполните оба поля");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Пароли не совпадают");
            return;
        }

        setPasswordError("");
        dispatch(changePassword(password));
        setPassword("");
        setConfirmPassword("");
    };

    const handleTimezoneChange = () => {
        if (!user?.profile?.userId) return;

        const oldTimezoneId = user.profile.timezoneId;
        const newTimezoneObj = timezones.find((tz) => tz.name === timezone);
        const newTimezoneId = newTimezoneObj?.id;

        if (!newTimezoneId) {
            console.error("Не удалось найти id нового часового пояса");
            return;
        }

        dispatch(
            updateUserTimezone({
                oldTimezoneId: oldTimezoneId || null,
                newTimezoneId,
                userId: user.profile.userId,
            })
        ).then(() => dispatch(fetchUserProfile()));
    };

    return (
        <>
        <Typography variant="h4" gutterBottom>
            Профиль пользователя
        </Typography>
        <Box sx={{ p: 3, display: "flex", justifyContent: "space-between" }}>

            <Box sx={{ width: "48%" }}>
                <TextField
                    fullWidth
                    label="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Email"
                    value={email}
                    margin="normal"
                    disabled
                />

                <TextField
                    select
                    fullWidth
                    label="Часовой пояс"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    margin="normal"
                >
                    {timezones.map((tz) => (
                        <MenuItem key={tz.name} value={tz.name}>
                            {`${tz.name} (UTC${tz.offset >= 0 ? "+" : ""}${tz.offset})`}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    label="ID департамента"
                    type="number"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="ID роли"
                    type="number"
                    value={roleId}
                    onChange={(e) => setRoleId(Number(e.target.value))}
                    margin="normal"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                    }
                    label="Активен"
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isAdmin}
                            onChange={(e) => setIsAdmin(e.target.checked)}
                        />
                    }
                    label="Администратор"
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    sx={{ mt: 2 }}
                >
                    Сохранить
                </Button>
            </Box>

            <Box sx={{ width: "48%" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Смена пароля
                </Typography>

                <TextField
                    fullWidth
                    label="Новый пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Повторите пароль"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    margin="normal"
                    error={!!passwordError}
                    helperText={passwordError}
                />

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleChangePassword}
                    sx={{ mt: 2 }}
                >
                    Изменить пароль
                </Button>
            </Box>
        </Box>
            </>
    );
};

export default UserProfile;
