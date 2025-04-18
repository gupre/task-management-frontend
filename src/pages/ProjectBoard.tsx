import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    Modal,
    Paper,
    Grid,
    Stack,
    Fade,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
    fetchProjects,
    deleteProject,
    createProject,
    updateProject,
    fetchMyProjects,
    fetchProjectUsers,
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
    const [openUsersProjectId, setOpenUsersProjectId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchProjects());
        dispatch(fetchMyProjects());
    }, [dispatch]);

    const handleOpenForm = useCallback((project?: Project) => {
        setEditingProject(project || null);
        setOpenForm(true);
    }, []);

    const handleCloseForm = useCallback(() => {
        setOpenForm(false);
        setEditingProject(null);
    }, []);

  const handleSaveProject = useCallback(
    (projectIdOrProject: number | Partial<Project>, changedFields?: Partial<Project>) => {
      if (typeof projectIdOrProject === "number") {
        // Редактирование существующего проекта по id
        if (changedFields) {
          dispatch(updateProject({ ...changedFields, projectId: projectIdOrProject } as Project));
        }
      } else {
        // Создание нового проекта
        dispatch(createProject(projectIdOrProject as Project));
      }
      handleCloseForm();
    },
    [dispatch, handleCloseForm]
  );



  const handleOpenUsers = useCallback((projectId?: number) => {
        if (!projectId) return;
        setOpenUsersProjectId(projectId);
    }, []);

    const handleCloseUsers = useCallback(() => {
        setOpenUsersProjectId(null);
    }, []);

    return (
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" fontWeight={600}>
                  Управление проектами
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenForm()}
                sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
              >
                  Новый проект
              </Button>
          </Stack>

          <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item key={project.projectId} xs={12} sm={6} md={4}>
                    <ProjectCard
                      project={project}
                      onEdit={() => handleOpenForm(project)}
                      onDelete={() => dispatch(deleteProject(project.projectId))}
                      onManageUsers={() => handleOpenUsers(project.projectId)}
                    />
                </Grid>
              ))}
          </Grid>

          <Modal open={!!openUsersProjectId} onClose={handleCloseUsers} closeAfterTransition>
              <Fade in={!!openUsersProjectId}>
                  <Paper
                    sx={{
                      p: 4,
                      width: { xs: "95%", sm: "90%", md: "80%", lg: "70%" },
                      maxWidth: 1200,
                      mx: "auto",
                      mt: 10,
                      borderRadius: 3,
                      boxShadow: 10,
                    }}
                  >
                    {openUsersProjectId && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 3,
                          borderRadius: 3,
                          backgroundColor: "#fafafa",
                          boxShadow: 4,
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#1976d2",
                            mb: 3,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Управление участниками проекта
                        </Typography>

                        <Grid container spacing={3} alignItems="stretch">
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={3}
                              sx={{
                                p: 2,
                                height: "100%",
                                maxHeight: 500,
                                overflowY: "auto",
                                borderRadius: 3,
                                backgroundColor: "#ffffff",
                              }}
                            >
                              <ProjectUsers projectId={openUsersProjectId} />
                            </Paper>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={3}
                              sx={{
                                p: 2,
                                height: "100%",
                                borderRadius: 3,
                                backgroundColor: "#ffffff",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <AddUserToProject
                                projectId={openUsersProjectId}
                                onUserAdded={() => dispatch(fetchProjectUsers(openUsersProjectId))}
                              />
                            </Paper>
                          </Grid>
                        </Grid>

                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{
                            mt: 4,
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 500,
                          }}
                          onClick={handleCloseUsers}
                        >
                          Закрыть
                        </Button>
                      </Box>
                    )}
                  </Paper>
              </Fade>
          </Modal>

          <Modal open={openForm} onClose={handleCloseForm} closeAfterTransition>
              <Fade in={openForm}>
                  <Paper
                    sx={{
                        p: 4,
                        width: { xs: "90%", sm: 400 },
                        mx: "auto",
                        mt: 10,
                        borderRadius: 3,
                        boxShadow: 10,
                    }}
                  >
                      <ProjectForm
                        initialProject={editingProject || undefined}
                        onSave={handleSaveProject}
                        onCancel={handleCloseForm}
                      />
                  </Paper>
              </Fade>
          </Modal>
      </Box>
    );
};

export default ProjectBoard;
