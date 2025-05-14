import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box, IconButton
} from '@mui/material'
import { Project } from "../../types";
import { formatDate } from '../tasks/TaskCard'
import { useNavigate } from 'react-router-dom'
import { Delete, Edit } from '@mui/icons-material'

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onManageUsers: () => void;
  isAdmin: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
                                                   project,
                                                   onEdit,
                                                   onDelete,
                                                   onManageUsers,
                                                   isAdmin
                                                 }) => {

  const navigate = useNavigate();

  const handleOpenReport = () => {
    navigate(`/reports/project/${project.projectId}`);
  };

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
        <Box>
          {isAdmin && (
            <Button
              size="small"
              variant="outlined"
              onClick={onManageUsers}
              sx={{ borderRadius: 2, mr: 2 }}
            >
              Участники
            </Button>
          )}

          <Button
            size="small"
            variant="contained"
            onClick={handleOpenReport}
            sx={{ borderRadius: 2 }}
          >
            Отчёт
          </Button>
        </Box>

        {isAdmin && (
          <Box>
            <IconButton onClick={onEdit} color="primary" size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={onDelete} color="error" size="small">
              <Delete />
            </IconButton>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
