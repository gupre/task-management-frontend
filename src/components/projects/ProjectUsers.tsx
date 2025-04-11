import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import {AppDispatch, RootState} from "../../store";
import { fetchProjectUsers } from "../../store/projectSlice";
import ProjectUserCard from "./ProjectUserCard";

interface ProjectUsersProps {
    projectId: number | undefined;
}

const ProjectUsers: React.FC<ProjectUsersProps> = ({ projectId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const users = useSelector((state: RootState) => state.projects.users);
    const loading = useSelector((state: RootState) => state.projects.loading);

    useEffect(() => {
        dispatch(fetchProjectUsers(projectId));
    }, [dispatch, projectId]);

    if (loading) return <Typography>Загрузка...</Typography>;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Участники проекта</Typography>
            {users.map((user: { user: { userId: number; name: string } }) => (
                <ProjectUserCard key={user.user.userId} projectId={projectId} userId={user.user.userId} userName={user.user.name} />
            ))}
        </Box>
    );
};

export default ProjectUsers;
