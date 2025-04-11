import React, { useState } from "react";
import {
    Box,
    TextField,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Grid,
    SelectChangeEvent,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {History, ReportTask, Task, User} from "../../types";

interface TaskFormProps {
    initialTask?: Task;
    onSave: (task: Task) => void;
    onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSave, onCancel }) => {
    const projects = useSelector((state: RootState) => state.projects.items);
    // const users = useSelector((state: RootState) => state.projects.users); // предполагаем, что есть slice users
    // const departments = useSelector((state: RootState) => state.department.items); // и departments

    const [task, setTask] = useState<Omit<Task, "taskId">>(
        initialTask || {
            name: "",
            description: "",
            status: "planned",
            priority: "normal",
            projectId: projects.length > 0 ? Number(projects[0].projectId) : 0,
            assignmentDate: "",
            dueDate: "",
            estimatedHours: 0,
            hoursSpent: 0,
            userId: undefined,
            departmentId: undefined,
            user: undefined,
            history: [],
            reports: [],
        }
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === "number" ? Number(value) : value;
        setTask((prev) => ({ ...prev, [name]: parsedValue }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        if (name) {
            setTask((prev) => ({
                ...prev,
                [name]: ["projectId", "userId", "departmentId"].includes(name) ? Number(value) : value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(task);
    };

    return (
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
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Название"
                        name="name"
                        value={task.name}
                        onChange={handleInputChange}
                        required
                    />
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
                    <FormControl fullWidth>
                        <InputLabel>Проект</InputLabel>
                        <Select name="projectId" value={`${task.projectId}`} onChange={handleSelectChange}>
                            {projects.map((project) => (
                                <MenuItem key={project.projectId} value={project.projectId}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Дата назначения"
                        name="assignmentDate"
                        type="date"
                        value={task.assignmentDate || ""}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Дедлайн"
                        name="dueDate"
                        type="date"
                        value={task.dueDate || ""}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
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

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Потрачено часов"
                        name="hoursSpent"
                        type="number"
                        value={task.hoursSpent || ""}
                        onChange={handleInputChange}
                        inputProps={{ min: 0 }}
                    />
                </Grid>

                {/*<Grid item xs={12} sm={6}>*/}
                {/*    <FormControl fullWidth>*/}
                {/*        <InputLabel>Исполнитель</InputLabel>*/}
                {/*        <Select*/}
                {/*            name="userId"*/}
                {/*            value={task.userId ? String(task.userId) : ""}*/}
                {/*            onChange={handleSelectChange}*/}
                {/*        >*/}
                {/*            <MenuItem value="">Не назначено</MenuItem>*/}
                {/*            {users.map((user) => (*/}
                {/*                <MenuItem key={user.user.userId} value={user.user.userId}>*/}
                {/*                    {user.user.name}*/}
                {/*                </MenuItem>*/}
                {/*            ))}*/}
                {/*        </Select>*/}
                {/*    </FormControl>*/}
                {/*</Grid>*/}

                {/*<Grid item xs={12} sm={6}>*/}
                {/*    <FormControl fullWidth>*/}
                {/*        <InputLabel>Департамент</InputLabel>*/}
                {/*        <Select*/}
                {/*            name="departmentId"*/}
                {/*            value={task.departmentId ? String(task.departmentId) : ""}*/}
                {/*            onChange={handleSelectChange}*/}
                {/*        >*/}
                {/*            <MenuItem value="">Не указано</MenuItem>*/}
                {/*            {departments.map((dept) => (*/}
                {/*                <MenuItem key={dept.id} value={dept.id}>*/}
                {/*                    {dept.name}*/}
                {/*                </MenuItem>*/}
                {/*            ))}*/}
                {/*        </Select>*/}
                {/*    </FormControl>*/}
                {/*</Grid>*/}

                <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                        <Button variant="contained" color="primary" type="submit">
                            Сохранить
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={onCancel}>
                            Отмена
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaskForm;
