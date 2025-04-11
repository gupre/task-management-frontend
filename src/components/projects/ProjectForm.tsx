import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import { Project } from "../../types";

interface ProjectFormProps {
    initialProject?: Project;
    onSave: (project: Project) => void;
    onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialProject, onSave, onCancel }) => {
    const [project, setProject] = useState<Omit<Project, "projectId">>(
        initialProject || {
            name: "",
            description: "",
            status: "planned",
            startDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
            endDate: "",
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(project);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="Название проекта" name="name" value={project.name} onChange={handleChange} required fullWidth />
            <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select name="status" value={project.status} onChange={handleSelectChange} variant="outlined">
                    <MenuItem value="planned">Запланирован</MenuItem>
                    <MenuItem value="progress">В процессе</MenuItem>
                    <MenuItem value="end">Завершён</MenuItem>
                </Select>
            </FormControl>

            <TextField
                label="Дата начала"
                name="startDate"
                type="date"
                value={project.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
            />
            <TextField
                label="Дата окончания"
                name="endDate"
                type="date"
                value={project.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
            />

            <TextField
                label="Описание"
                name="description"
                value={project.description}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                sx={{ gridColumn: "1 / -1" }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, gridColumn: "1 / -1" }}>
                <Button variant="contained" color="primary" type="submit">
                    Сохранить
                </Button>
                <Button variant="outlined" color="secondary" onClick={onCancel}>
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default ProjectForm;
