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
    Grid,
    AccordionDetails,
    Accordion, AccordionSummary, Paper, Stack, Divider, Chip, ListItemText, IconButton, List, ListItem
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { fetchAllDepartments, updateUserDepartment } from '../store/departmentSlice'
import { UnavailabilityPeriod, User } from '../types'
import dayjs from 'dayjs'
import { typeColors, typeLabels } from '../components/user/AdminUserScheduleEditor'

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
    const [unavailableDates, setUnavailableDates] = useState<UnavailabilityPeriod[]>([]);
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

        if (profile && profile.unavailabilityPeriods) {
            setUnavailableDates(profile.unavailabilityPeriods);
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
          workingEnd !== (originalProfile.workingHours?.end || "")
            // JSON.stringify(unavailableDates) !== JSON.stringify(originalProfile.unavailableDates || [])


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

        // if (workingStart && workingEnd) {
        //     updateData.workingHours = {
        //         start: workingStart,
        //         end: workingEnd,
        //     };
        // }

        // if (unavailableDates.length > 0) {
        //     updateData.unavailableDates = unavailableDates;
        // }

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

    // Функция для группировки подряд идущих дат
    const groupConsecutiveDates = (dates: string[]) => {
        if (dates.length === 0) return [];

        const sortedDates = [...dates].sort((a, b) => dayjs(a).isBefore(b) ? -1 : 1);
        const groupedDates: string[] = [];
        let start: string | null = null;

        sortedDates.forEach((date, index) => {
            if (start === null) {
                start = date;
            } else {
                const prevDate = dayjs(sortedDates[index - 1]);
                const currentDate = dayjs(date);

                // Проверка, является ли текущая дата подряд идущей
                if (currentDate.diff(prevDate, 'day') === 1) {
                    return; // Если даты идут подряд, продолжаем
                } else {
                    groupedDates.push(start === sortedDates[index - 1] ? start : `${start} - ${sortedDates[index - 1]}`);
                    start = date; // Начинаем новую группу
                }
            }
        });

        // Добавляем последнюю группу
        if (start) {
            groupedDates.push(start === sortedDates[sortedDates.length - 1] ? start : `${start} - ${sortedDates[sortedDates.length - 1]}`);
        }

        return groupedDates;
    };

    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>
          <Typography variant="h4" align="center" gutterBottom>
              {user?.profile?.name}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        disabled
                      />
                      <TextField
                        select
                        fullWidth
                        label="Часовой пояс"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
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
                      >
                          {departments.map((d) => (
                            <MenuItem key={d.name} value={d.name}>
                                {d.name}
                            </MenuItem>
                          ))}
                      </TextField>

                      {/*<FormControlLabel*/}
                      {/*  control={*/}
                      {/*      <Checkbox*/}
                      {/*        checked={isActive}*/}
                      {/*        onChange={(e) => setIsActive(e.target.checked)}*/}
                      {/*      />*/}
                      {/*  }*/}
                      {/*  label="Активен"*/}
                      {/*/>*/}
                      {/*<FormControlLabel*/}
                      {/*  control={*/}
                      {/*      <Checkbox*/}
                      {/*        checked={isAdmin}*/}
                      {/*        onChange={(e) => setIsAdmin(e.target.checked)}*/}
                      {/*      />*/}
                      {/*  }*/}
                      {/*  label="Администратор"*/}
                      {/*/>*/}
                  </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                  <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Рабочее время и отпуск</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                          <Stack spacing={2}>
                              <TextField
                                fullWidth
                                label="Начало дня"
                                value={workingStart}
                                InputProps={{ readOnly: true }}
                              />
                              <TextField
                                fullWidth
                                label="Окончание дня"
                                value={workingEnd}
                                InputProps={{ readOnly: true }}
                              />
                              <Stack spacing={2}>
                                  <Typography>Выходные дни</Typography>
                                  <Paper variant="outlined" sx={{ maxHeight: 150, overflowY: 'auto', p: 1 }}>
                                      <Stack direction="row" flexWrap="wrap" gap={1}>
                                          {unavailableDates.map((p, index) => (
                                            <Chip key={index}
                                                  sx={{ mr: 1, mb: 1 }}
                                                  color={typeColors[p.type]}
                                                  variant={p.active ? "filled" : "outlined"}
                                                  label={`${typeLabels[p.type]}: ${dayjs(p.start).format('DD.MM.YY')}${p.end && p.end !== p.start ? ` – ${dayjs(p.end).format('DD.MM.YY')}` : ""}${p.active === false ? " (неактивен)" : ""}`}
                                            />
                                          ))}
                                      </Stack>
                                  </Paper>
                              </Stack>
                          </Stack>
                      </AccordionDetails>
                  </Accordion>

                  <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Смена пароля</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                          <Stack spacing={2}>
                              <TextField
                                fullWidth
                                type="password"
                                label="Старый пароль"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                              />
                              <TextField
                                fullWidth
                                type="password"
                                label="Новый пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <TextField
                                fullWidth
                                type="password"
                                label="Подтверждение пароля"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                              {passwordError && (
                                <Typography color="error" variant="body2">
                                    {passwordError}
                                </Typography>
                              )}
                              <Button
                                variant="contained"
                                onClick={handleChangePassword}
                                disabled={isPasswordChanging}
                              >
                                  Сменить пароль
                              </Button>
                          </Stack>
                      </AccordionDetails>
                  </Accordion>
              </Grid>

              <Grid item xs={12}>
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={!hasChanges}
                      >
                          Сохранить изменения
                      </Button>
                  </Box>
              </Grid>
          </Grid>
      </Paper>
    );

};

export default UserProfile;
