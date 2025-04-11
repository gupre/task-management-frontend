import React from "react";
import { Task } from "../../types";
import { Card, CardContent, Typography, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: number | undefined) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    const handleDelete = () => {
        const id = task.taskId;
        onDelete(id);
    };

    return (
        <Card sx={{ mb: 2, p: 2 }}>
            <CardContent>
                <Typography variant="h6">{task.name}</Typography>
                <Typography color="textSecondary">{task.description}</Typography>
                <Typography variant="body2">Приоритет: {task.priority}</Typography>
                <Typography variant="body2">Статус: {task.status}</Typography>
                {(task.assignmentDate && <Typography variant="body2">Начало: {task.assignmentDate}</Typography>)}
                {(task.dueDate && <Typography variant="body2">Срок: {task.dueDate}</Typography>)}
                <IconButton onClick={() => onEdit(task)} color="primary">
                    <Edit />
                </IconButton>
                <IconButton onClick={handleDelete} color="error">
                    <Delete />
                </IconButton>
            </CardContent>
        </Card>
    );
};
