import React from "react";
import { Button, Card, CardContent, CardActions, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { removeUserFromProject } from "../../store/projectSlice";
import { AppDispatch } from "../../store";

interface ProjectUserProps {
    projectId: number | undefined;
    userId: number;
    userName: string;
}

const ProjectUserCard: React.FC<ProjectUserProps> = ({ projectId, userId, userName }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleRemoveUser = () => {
        dispatch(removeUserFromProject({ projectId, userId }));
    };

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6">{userName}</Typography>
            </CardContent>
            <CardActions>
                <Button size="small" color="secondary" onClick={handleRemoveUser}>
                    Удалить
                </Button>
            </CardActions>
        </Card>
    );
};

export default ProjectUserCard;
