import React, { useEffect, useState } from 'react'
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Grid,
    SelectChangeEvent, Typography
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { CreateTask } from '../../types'
import { fetchAllDepartments } from '../../store/departmentSlice'
import { fetchProjectUsers } from '../../store/projectSlice'
import { fetchTaskHistory } from '../../store/historySlice'

interface TaskFormProps {
    initialTask?: Partial<CreateTask> & { taskId?: number };
    onSave: (task: Partial<CreateTask> & { taskId?: number }) => void;
    onCancel: () => void;
    projectId: number;
}

const TaskForm: React.FC<TaskFormProps> = ({ projectId, initialTask, onSave, onCancel }) =>  {
    const dispatch = useDispatch<AppDispatch>();

    const users = useSelector((state: RootState) => state.projects.users);
    const departments = useSelector((state: RootState) => state.department.departments);

    const [task, setTask] = useState<Partial<CreateTask> & { taskId?: number }>(
      initialTask || {
          name: "",
          description: "",
          status: "planned",
          priority: "normal",
          projectId,
          assignmentDate: new Date().toISOString().slice(0, 10),
          dueDate: "",
          estimatedHours: 0,
          hoursSpent: 0,
          userId: undefined,
          departmentId: undefined,
      }
    );
    const [newHours, setNewHours] = useState<number>(0);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        dispatch(fetchProjectUsers(projectId))
        dispatch(fetchAllDepartments());
    }, [dispatch, projectId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let parsedValue = type === "number" ? Math.max(0, Number(value)) : value;

        // Если значение - дата, преобразуем его в формат yyyy-mm-dd
        if (name === "assignmentDate" || name === "dueDate") {
            const date = new Date(parsedValue);
            if (!isNaN(date.getTime())) {
                parsedValue = date.toISOString().split('T')[0]; // Формат yyyy-mm-dd
            }
        }

        setTask((prev) => ({ ...prev, [name]: parsedValue }));
    };


    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        if (name) {
            setTask((prev) => ({
                ...prev,
                [name]: ["userId", "departmentId"].includes(name) ? Number(value) : value,
            }));
        }
    };

    const validateForm = (): boolean => {
        let formErrors: { [key: string]: string } = {};
        if (!task.name) formErrors.name = "Название задачи обязательно";
        if (!task.dueDate) formErrors.dueDate = "Дедлайн обязателен";

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(task);  // сохраняем задачу
            // Дополнительно обновляем историю:
            if (task.taskId) {
                dispatch(fetchTaskHistory(task.taskId));  // перезагружаем историю
            }
        }
    };

    const handleAddHours = () => {
        setTask((prev) => ({
            ...prev,
            hoursSpent: (prev.hoursSpent || 0) + newHours,
        }));
        setNewHours(0);
    };

    return (
      <>
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                flexGrow: 1,
                maxWidth: 800,
                mx: "auto",
                mt: 4,
            }}
        >
            <Typography mb={2} textAlign="center" variant="h6">
                {initialTask ? "Редактирование задачи" : "Создание задачи"}
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Название"
                              name="name"
                              value={task.name}
                              onChange={handleInputChange}
                              required
                              error={!!errors.name}
                              helperText={errors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Описание"
                              name="description"
                              value={task.description}
                              onChange={handleInputChange}
                              multiline
                              rows={3}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Статус</InputLabel>
                        <Select name="status" value={task.status} onChange={handleSelectChange}>
                            <MenuItem value="planned">Запланировано</MenuItem>
                            <MenuItem value="progress">В процессе</MenuItem>
                            <MenuItem value="end">Завершено</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Приоритет</InputLabel>
                        <Select name="priority" value={task.priority} onChange={handleSelectChange}>
                            <MenuItem value="urgently">Срочно</MenuItem>
                            <MenuItem value="high">Высокий</MenuItem>
                            <MenuItem value="normal">Средний</MenuItem>
                            <MenuItem value="low">Низкий</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Дата назначения"
                        name="assignmentDate"
                        type="date"
                        value={task.assignmentDate?.slice(0, 10) || ""}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Дедлайн*"
                        name="dueDate"
                        type="date"
                        value={task.dueDate?.slice(0, 10) || ""}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dueDate}
                        helperText={errors.dueDate}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Оценка часов"
                        name="estimatedHours"
                        type="number"
                        value={task.estimatedHours || ""}
                        onChange={handleInputChange}
                        inputProps={{ min: 0 }}
                    />
                </Grid>

                {task.taskId && (
                <Grid item xs={12} sm={6} display="flex" alignItems="center">
                    <TextField
                      fullWidth
                      label="Потрачено часов"
                      name="hoursSpent"
                      type="number"
                      value={task.hoursSpent || ""}
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      fullWidth
                      label="Добавить часы"
                      type="number"
                      value={newHours}
                      onChange={(e) => setNewHours(Number(e.target.value))}
                      inputProps={{ min: 0 }}
                      sx={{ ml: 2 }}
                    />
                    <Button  size="small"  onClick={handleAddHours} variant="outlined" sx={{ ml: 2 }}>
                        ➕
                    </Button>
                </Grid>)}


                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Исполнитель</InputLabel>
                        <Select
                            name="userId"
                            value={task.userId ? String(task.userId) : ""}
                            onChange={handleSelectChange}
                        >
                            <MenuItem value="">Не назначено</MenuItem>
                            {users.map((user) => (
                                <MenuItem key={user.user.userId} value={user.user.userId}>
                                    {user.user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Департамент</InputLabel>
                        <Select
                          name="departmentId"
                          value={task.departmentId ? String(task.departmentId) : ""}
                          onChange={handleSelectChange}
                        >
                            <MenuItem value="">Не указано</MenuItem>
                            {departments.map((dept) => (
                              <MenuItem key={dept.departmentId} value={dept.departmentId}>
                                  {dept.name}
                              </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
                    <Button variant="contained" color="primary" type="submit">
                        Сохранить
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={onCancel}>
                        Закрыть
                    </Button>
                </Grid>
            </Grid>
        </Box>
      </>
    );
};

export default TaskForm;
