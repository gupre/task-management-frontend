import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Modal, Paper } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
    fetchProjects,
    deleteProject,
    createProject,
    updateProject,
    fetchMyProjects,
    fetchProjectUsers
} from "../store/projectSlice";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import { Project } from "../types";
import AddUserToProject from "../components/projects/AddUserToProject";
import ProjectUsers from "../components/projects/ProjectUsers";

const ProjectBoard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const projects = useSelector((state: RootState) => state.projects.items);
    const [openForm, setOpenForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [openUsersProjectId, setOpenUsersProjectId] = useState<number | null | undefined>(null);

    useEffect(() => {
        console.log("Полученные проекты:", projects);
        dispatch(fetchProjects());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchMyProjects());
    }, [dispatch]);

    const handleOpenForm = (project?: Project) => {
        setEditingProject(project || null);
        setOpenForm(true);
    };

    const handleCloseForm = () => {
        setOpenForm(false);
    };

    const handleSaveProject = (project: Project) => {
        if (editingProject) {
            dispatch(updateProject(project));
        } else {
            dispatch(createProject(project));
        }
        handleCloseForm();
    };

    const handleOpenUsers = (projectId: number | undefined) => {
        if (projectId === undefined) {
            console.error("Некорректный ID проекта:", projectId);
            return;
        }
        setOpenUsersProjectId(projectId);
    };

    const handleCloseUsers = () => {
        setOpenUsersProjectId(null);
    };

    useEffect(() => {
        console.log("Состояние openUsersProjectId:", openUsersProjectId);
    }, [openUsersProjectId]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Управление проектами
            </Typography>

            <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenForm()}>
                Добавить проект
            </Button>

            <Box>
                {projects.map((project) => {
                    console.log("Проект:", project);
                    return (
                        <ProjectCard
                            key={project.projectId}
                            project={project}
                            onEdit={() => handleOpenForm(project)}
                            onDelete={() => dispatch(deleteProject(project.projectId))}
                            onManageUsers={() => handleOpenUsers(project.projectId)}
                        />
                    );
                })}
            </Box>

            {openUsersProjectId !== null  && (
                <Modal open={!!openUsersProjectId} onClose={handleCloseUsers}>
                    <Paper sx={{ p: 3, width: 500, margin: "100px auto" }}>
                        <ProjectUsers projectId={openUsersProjectId} />
                        <AddUserToProject projectId={openUsersProjectId} onUserAdded={() => dispatch(fetchProjectUsers(openUsersProjectId))} />
                        <Button onClick={handleCloseUsers} sx={{ mt: 2 }}>Закрыть</Button>
                    </Paper>
                </Modal>
            )}

            <Modal open={openForm} onClose={handleCloseForm}>
                <Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
                    <ProjectForm initialProject={editingProject || undefined} onSave={handleSaveProject} onCancel={handleCloseForm} />
                </Paper>
            </Modal>
        </Box>
    );
};

export default ProjectBoard;
