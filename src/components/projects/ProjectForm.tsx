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
  Typography,
} from "@mui/material";
import { Project } from "../../types";

interface ProjectFormProps {
  initialProject?: Project;
  onSave: (projectIdOrProject: Partial<Project> | number, changedFields?: Partial<Project>) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialProject, onSave, onCancel }) => {
  const [project, setProject] = useState<Omit<Project, "projectId">>(
    initialProject || {
      name: "",
      description: "",
      status: "planned",
      startDate: new Date().toISOString().slice(0, 10),
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
    if (!initialProject) {
      // Если проект новый — отправляем весь
      onSave(project);
    } else {
      const changedFields: Partial<Project> = {};

      for (const key in project) {
        const typedKey = key as keyof Omit<Project, "projectId">;
        const newValue = project[typedKey];
        const oldValue = initialProject?.[typedKey];

        if (newValue !== oldValue) {
          if (typedKey === 'status') {
            changedFields[typedKey] = newValue as Project['status'];
          } else {
            changedFields[typedKey] = newValue;
          }
        }
      }

      if (initialProject?.projectId !== undefined) {
        onSave(initialProject.projectId, changedFields);
      }

    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 2,
        p: 2,
        maxWidth: 800,
        mx: "auto",
      }}
    >
      <Typography variant="h6" sx={{ gridColumn: "1 / -1", mb: 1 }}>
        {initialProject ? "Редактировать проект" : "Создать новый проект"}
      </Typography>

      <TextField
        label="Название проекта"
        name="name"
        value={project.name}
        onChange={handleChange}
        required
        fullWidth
        placeholder="Например: CRM-система"
      />

      <FormControl fullWidth>
        <InputLabel>Статус</InputLabel>
        <Select
          name="status"
          value={project.status}
          onChange={handleSelectChange}
          label="Статус"
        >
          <MenuItem value="planned">Запланирован</MenuItem>
          <MenuItem value="progress">В процессе</MenuItem>
          <MenuItem value="end">Завершён</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Дата начала"
        name="startDate"
        type="date"
        value={project.startDate?.slice(0, 10) || ""}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <TextField
        label="Дата окончания"
        name="endDate"
        type="date"
        value={project.endDate?.slice(0, 10) || ""}
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
        placeholder="Краткое описание целей и задач проекта"
        sx={{ gridColumn: "1 / -1" }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          gridColumn: "1 / -1",
          mt: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ minWidth: 120 }}
        >
          Сохранить
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
          sx={{ minWidth: 120 }}
        >
          Отмена
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectForm;
