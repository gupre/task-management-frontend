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
    Grid,
    AccordionDetails,
    Accordion, AccordionSummary, Paper
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
    const [workingStart, setWorkingStart] = useState("");
    const [workingEnd, setWorkingEnd] = useState("");


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
        if (profile && profile.workingHours) {
            setWorkingStart(profile.workingHours.start);
            setWorkingEnd(profile.workingHours.end);
        }

        if (profile && profile.unavailableDates) {
            setUnavailableDates(profile.unavailableDates);
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
          department !== originalDepartment ||
          workingStart !== (originalProfile.workingHours?.start || "") ||
          workingEnd !== (originalProfile.workingHours?.end || "") ||
            JSON.stringify(unavailableDates) !== JSON.stringify(originalProfile.unavailableDates || [])


        setHasChanges(isChanged);
    }, [name, isActive, isAdmin, timezone, department, originalProfile, originalTimezone, originalDepartment, workingStart, workingEnd, unavailableDates]);


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

        if (workingStart && workingEnd) {
            updateData.workingHours = {
                start: workingStart,
                end: workingEnd,
            };
        }

        if (unavailableDates.length > 0) {
            updateData.unavailableDates = unavailableDates;
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
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
              Профиль {user?.profile?.name}
          </Typography>

          <Grid container spacing={2} sx={{ p: 2 }}>
              {/* Левая колонка */}
              <Grid item xs={12} md={6}>
                  {[
                      { label: "Имя", value: name, onChange: setName },
                      { label: "Email", value: email, disabled: true },
                  ].map((field, idx) => (
                    <TextField
                      key={idx}
                      fullWidth
                      size="medium"
                      variant="outlined"
                      label={field.label}
                      value={field.value}
                      onChange={field.onChange ? (e) => field.onChange!(e.target.value) : undefined}
                      margin="normal"
                      disabled={field.disabled}
                    />
                  ))}

                  <TextField
                    select fullWidth margin="normal" size="medium"
                    label="Часовой пояс" value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                      {timezones.map((tz) => (
                        <MenuItem key={tz.name} value={tz.name}>
                            {`${tz.name} (UTC${tz.offset >= 0 ? "+" : ""}${tz.offset})`}
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    select fullWidth margin="normal" size="small"
                    label="Департамент" value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                      {departments.map((d) => (
                        <MenuItem key={d.name} value={d.name}>
                            {d.name}
                        </MenuItem>
                      ))}
                  </TextField>

                  {[{ label: "Активен", checked: isActive, onChange: setIsActive },
                      { label: "Администратор", checked: isAdmin, onChange: setIsAdmin }].map(({ label, checked, onChange }) => (
                    <FormControlLabel
                      key={label}
                      control={<Checkbox size="medium" checked={checked} onChange={(e) => onChange(e.target.checked)} />}
                      label={label}
                      sx={{ mt: 0, mb: -1 }}
                    />
                  ))}

                  <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">Рабочее время и отпуск</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                          {[
                              { label: "Начало дня", value: workingStart, onChange: setWorkingStart },
                              { label: "Окончание дня", value: workingEnd, onChange: setWorkingEnd },
                          ].map(({ label, value, onChange }, idx) => (
                            <TextField
                              key={idx}
                              fullWidth
                              size="medium"
                              variant="outlined"
                              label={label}
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              margin="normal"
                            />
                          ))}

                          <TextField
                            fullWidth
                            size="medium"
                            variant="outlined"
                            label="Отпуск (YYYY-MM-DD, через запятую)"
                            value={unavailableDates.join(", ")}
                            onChange={(e) =>
                              setUnavailableDates(
                                e.target.value.split(",").map((d) => d.trim()).filter(Boolean)
                              )
                            }
                            margin="normal"
                          />
                      </AccordionDetails>
                  </Accordion>

                  <Button
                    variant="contained"
                    size="medium"
                    sx={{ mt: 2 }}
                    onClick={handleSave}
                    disabled={!hasChanges}
                  >
                      Сохранить
                  </Button>
              </Grid>

              {/* Правая колонка */}
              <Grid item xs={12} md={6} sx={{ pt: '8px', mt: '20px' }}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 0.5 }}>
                          Смена пароля
                      </Typography>

                      {[
                          { label: "Старый пароль", value: oldPassword, onChange: setOldPassword },
                          { label: "Новый пароль", value: password, onChange: setPassword },
                          {
                              label: "Повторите пароль",
                              value: confirmPassword,
                              onChange: setConfirmPassword,
                              error: !!passwordError,
                              helperText: passwordError,
                          },
                      ].map((field, idx) => (
                        <TextField
                          key={idx}
                          fullWidth
                          size="medium"
                          variant="outlined"
                          type="password"
                          label={field.label}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          margin="normal"
                          error={field.error}
                          helperText={field.helperText}
                        />
                      ))}

                      <Button
                        variant="contained"
                        color="secondary"
                        size="medium"
                        sx={{ mt: 2 }}
                        onClick={handleChangePassword}
                        disabled={!password || !confirmPassword || isPasswordChanging}
                      >
                          {isPasswordChanging ? "Сохраняем..." : "Изменить пароль"}
                      </Button>
                  </Paper>
              </Grid>
          </Grid>
      </>
    );

};

export default UserProfile;
