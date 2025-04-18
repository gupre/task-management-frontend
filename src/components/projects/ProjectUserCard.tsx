import React, { useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar, Box
} from '@mui/material'
import { useDispatch } from "react-redux";
import { fetchProjectUsers, removeUserFromProject } from '../../store/projectSlice'
import { AppDispatch } from "../../store";
import PersonIcon from "@mui/icons-material/Person";

interface ProjectUserProps {
  projectId: number | undefined;
  userId: number;
  userName: string;
  departmentName?: string;
}

const ProjectUserCard: React.FC<ProjectUserProps> = ({ projectId, userId, userName,  departmentName }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemoveUser = () => {
    dispatch(removeUserFromProject({ projectId, userId }));
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 1, mb: 1 }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{userName}</Typography>
          {departmentName && (
            <Typography variant="body2" color="text.secondary">
              Департамент: {departmentName}
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        <Button size="small" color="error" onClick={handleRemoveUser}>
          Удалить
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectUserCard;
