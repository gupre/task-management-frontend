import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { Project } from "../../types";
import { formatDate } from '../tasks/TaskCard'

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onManageUsers: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
                                                   project,
                                                   onEdit,
                                                   onDelete,
                                                   onManageUsers,
                                                 }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 3,
        boxShadow: 3,
        transition: "0.2s ease",
        "&:hover": { boxShadow: 6 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
          {project.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {project.description || "Описание отсутствует"}
        </Typography>
        {/* Даты начала и окончания проекта */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Начало: {project.startDate ? formatDate(project.startDate) : "Не указано"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Окончание: {project.endDate ? formatDate(project.endDate) : "Не указано"}
          </Typography>
        </Box>
      </CardContent>

      <CardActions
        sx={{
          px: 2,
          pb: 2,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={onManageUsers}
          sx={{ borderRadius: 2 }}
        >
          Участники
        </Button>
        <Box>
          <Button
            size="small"
            color="primary"
            onClick={onEdit}
            sx={{ mr: 1, borderRadius: 2 }}
          >
            Редактировать
          </Button>
          <Button
            size="small"
            color="error"
            onClick={onDelete}
            sx={{ borderRadius: 2 }}
          >
            Удалить
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
