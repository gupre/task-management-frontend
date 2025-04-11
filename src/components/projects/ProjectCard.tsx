import React from "react";
import { Card, CardContent, CardActions, Typography, Button } from "@mui/material";
import { Project } from "../../types";

interface ProjectCardProps {
    project: Project;
    onEdit: () => void;
    onDelete: () => void;
    onManageUsers: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onManageUsers }) => {

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {project.description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={onManageUsers}>
                    Участники
                </Button>
                <Button size="small" color="primary" onClick={onEdit}>
                    Редактировать
                </Button>
                <Button size="small" color="secondary" onClick={onDelete}>
                    Удалить
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProjectCard;
