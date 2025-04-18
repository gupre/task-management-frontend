import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
    checkCurrentPassword,
    fetchUserProfile, updateUser
} from '../store/userSlice'
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
import { fetchAllDepartments, updateUserDepartment } from '../store/departmentSlice'
import { User } from '../types'

const UserProfile: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.user);
    const timezones = useSelector((state: RootState) => state.timeZone.timezones);
    const departments = useSelector((state: RootState) => state.department.departments);


    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [timezone, setTimezone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [department, setDepartment] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [oldPassword, setOldPassword] = useState("");

    const [hasChanges, setHasChanges] = useState(false);
    const [originalProfile, setOriginalProfile] = useState<User | null>(null);
    const [originalTimezone, setOriginalTimezone] = useState("");
    const [originalDepartment, setOriginalDepartment] = useState("");

    useEffect(() => {
        dispatch(fetchUserProfile());
        dispatch(fetchTimezones());
        dispatch(fetchAllDepartments());
    }, [dispatch]);

    // Когда загружается профиль, и мы можем сразу отобразить основные поля
    useEffect(() => {
        const profile = user.profile;
        if (profile) {
            setName(profile.name || "");
            setEmail(profile.email || "");
            setIsActive(profile.isActive ?? false);
            setIsAdmin(profile.isAdmin ?? false);
            setOriginalProfile(profile);
        }
    }, [user.profile]);

// Когда загружаются таймзоны и уже есть профиль
    useEffect(() => {
        const profile = user.profile;

        if (profile && timezones.length > 0) {
            const matchedTimeZone = timezones.find(
              (tz) => Number(tz.timezoneId) === Number(profile?.timezoneId)
            );
            setTimezone(matchedTimeZone?.name || "");
            setOriginalTimezone(matchedTimeZone?.name || "");
        }
    }, [timezones, user.profile]);


    // Аналогично для департаментов
    useEffect(() => {
        const profile = user.profile;
        if (profile && departments.length > 0) {
            const matchedDepartment = departments.find(
              (d) => d.departmentId === Number(profile?.departmentId)
            );
            setDepartment(matchedDepartment?.name || "");
            setOriginalDepartment(matchedDepartment?.name || "");
        }
    }, [departments, user.profile]);


    useEffect(() => {
        if (!originalProfile) return;

        const isChanged =
          name !== (originalProfile.name || "") ||
          isActive !== (originalProfile.isActive ?? false) ||
          isAdmin !== (originalProfile.isAdmin ?? false) ||
          timezone !== originalTimezone ||
          department !== originalDepartment;

        setHasChanges(isChanged);
    }, [name, isActive, isAdmin, timezone, department, originalProfile, originalTimezone, originalDepartment]);


    const handleSave = () => {
        if (!user.profile) return;

        const updateData: Partial<User> = {};

        if (name !== user.profile.name) {
            updateData.name = name;
        }
        if (isActive !== user.profile.isActive) {
            updateData.isActive = isActive;
        }
        if (isAdmin !== user.profile.isAdmin) {
            updateData.isAdmin = isAdmin;
        }

        if (Object.keys(updateData).length > 0) {
            dispatch(updateUser({
                userId: user.profile.userId,
                updateData,
            })).then(() => dispatch(fetchUserProfile()));
        }

        handleTimezoneChange();
        handleDepartmentChange();
    };


    const handleChangePassword = async () => {
        if (!password || !confirmPassword) {
            setPasswordError("Заполните оба поля");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Пароли не совпадают");
            return;
        }

        // Проверка на минимальную длину и требования к паролю
        const passwordValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};:'",.<>\/\\|`~]).{8,}$/;
        if (!passwordValid.test(password)) {
            setPasswordError(
              "Пароль должен быть не короче 8 символов и содержать хотя бы одну заглавную букву, цифру и специальный символ"
            );
            return;
        }

        if (!user.profile) {
            setPasswordError("Профиль пользователя не загружен");
            return;
        }

        setPasswordError("");
        setIsPasswordChanging(true);

        try {
            const isCorrect = await dispatch(
              checkCurrentPassword({
                  userId: user.profile.userId,
                  password: oldPassword,
              })
            ).unwrap();

            if (!isCorrect) {
                setPasswordError("Старый пароль введён неверно");
                setIsPasswordChanging(false);
                return;
            }

            await dispatch(updateUser({
                userId: user.profile.userId,
                updateData: { password },
            })).unwrap();

            setOldPassword("");
            setPassword("");
            setConfirmPassword("");
            alert("Пароль успешно изменен!");
        } catch (error) {
            setPasswordError("Не удалось сменить пароль. Попробуйте позже.");
        } finally {
            setIsPasswordChanging(false);
        }
    };

    const handleTimezoneChange = () => {
        if (!user?.profile?.userId) return;

        const oldTimezoneId = user.profile.timezoneId;
        const newTimezoneObj = timezones.find((tz) => tz.name === timezone);
        const newTimezoneId = newTimezoneObj?.timezoneId;

        if (!newTimezoneId) {
            console.error("Не удалось найти id нового часового пояса");
            return;
        }

        if (newTimezoneId !== oldTimezoneId) {
            dispatch(
              updateUserTimezone({
                  oldTimezoneId: oldTimezoneId || null,
                  newTimezoneId,
                  userId: user.profile.userId,
              })
            ).then(() => dispatch(fetchUserProfile()));
        }
    };

    const handleDepartmentChange = () => {
        if (!user?.profile?.userId) return;

        const oldDepartmentId = user.profile.departmentId;
        const newDepartmentObj = departments.find((tz) => tz.name === department);
        const newDepartmentId = newDepartmentObj?.departmentId;

        if (!newDepartmentId) {
            console.error("Не удалось найти id нового часового пояса");
            return;
        }

        if (newDepartmentId !== oldDepartmentId) {
            dispatch(
              updateUserDepartment({
                  oldDepartmentId: oldDepartmentId || null,
                  newDepartmentId,
                  userId: user.profile.userId,
              })
            ).then(() => dispatch(fetchUserProfile()));
        }
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
                    select
                    fullWidth
                    label="Департамент"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    margin="normal"
                >
                    {departments.map((tz) => (
                        <MenuItem key={tz.name} value={tz.name}>
                            {`${tz.name}`}
                        </MenuItem>
                    ))}
                </TextField>

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
                    disabled={!hasChanges}
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
                  label="Старый пароль"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  margin="normal"
                />

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
                  disabled={!password || !confirmPassword || isPasswordChanging}
                >
                    {isPasswordChanging ? "Сохраняем..." : "Изменить пароль"}
                </Button>
            </Box>
        </Box>
            </>
    );
};

export default UserProfile;
