import React from "react";
import { Task } from "../../types";
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { Edit, Delete, AccessTime, Person } from "@mui/icons-material";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number | undefined) => void;
}

const getBorderColor = (priority: string) => {
  switch (priority) {
    case "urgently":
      return "#d32f2f"; // ярко-красный
    case "high":
      return "#f57c00"; // насыщенный оранжевый
    case "normal":
      return "#1976d2"; // синий (средний)
    case "low":
      return "#388e3c"; // насыщенный зелёный
    default:
      return "transparent";
  }
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const handleDelete = () => {
    const id = task.taskId;
    onDelete(id);
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        p: 1.5,
        border: "1px solid",
        borderColor: getBorderColor(task.priority),
        position: "relative",
        minHeight: 120, // уменьшена высота
        borderRadius: 1,
        boxShadow: 2, // добавлена тень
        transition: "all 0.3s ease", // плавные анимации
        "&:hover": {
          boxShadow: 5, // при наведении на карточку эффект увеличенной тени
        }
      }}
    >
      <CardContent sx={{ paddingBottom: "36px" }}>
        <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: 14 }}>
          {task.name}
        </Typography>

        {(task.assignmentDate || task.dueDate) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <AccessTime fontSize="small" />
            <Typography variant="body2" sx={{ fontSize: 12 }}>
              {`${formatDate(task.assignmentDate)} – ${formatDate(task.dueDate)}`}
            </Typography>
          </Box>
        )}
      </CardContent>

      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          left: 16,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 0.5
        }}
      >
        {task.user?.name && (
          <>
            <Person fontSize="small" />
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              {task.user.name}
            </Typography>
          </>
        )}
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          right: 8,
          display: "flex",
          gap: 1,
        }}
      >
        <IconButton onClick={() => onEdit(task)} color="primary" size="small">
          <Edit />
        </IconButton>
        <IconButton onClick={handleDelete} color="error" size="small">
          <Delete />
        </IconButton>
      </Box>
    </Card>
  );
};
