import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  Paper,
  Grid,
  Stack,
  Fade, TextField, InputAdornment, Snackbar, IconButton
} from '@mui/material'
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
import SearchIcon from '@mui/icons-material/Search'
import { getToken } from '../utils/auth'
import CloseIcon from '@mui/icons-material/Close'
import { deleteTask } from '../store/taskSlice'

const ProjectBoard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const projects = useSelector((state: RootState) => state.projects.items);
    const [openForm, setOpenForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [openUsersProjectId, setOpenUsersProjectId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const token = useSelector(getToken);
    const email = useSelector((state: RootState) => state.auth.user?.email) || localStorage.getItem('email');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
      const fetchUserAndProjects = async () => {
        try {
          const userResponse = await fetch(`http://localhost:4200/api/users/email/${email}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error(`Ошибка получения пользователя: ${userResponse.status}`);
          }

          const userData = await userResponse.json();
          const userId = userData.userId;
          setIsAdmin(userData.isAdmin);

          if (!userId) {
            throw new Error("Не найден userId для текущего пользователя");
          }

          if (userData.isAdmin) {
            dispatch(fetchProjects());
          } else {
            dispatch(fetchMyProjects());
          }
        } catch (error) {
          console.error("Ошибка при получении пользователя:", error);
        }
      };

      fetchUserAndProjects();
    }, [dispatch, email, token]);


    const handleOpenForm = useCallback((project?: Project) => {
        setEditingProject(project || null);
        setOpenForm(true);
    }, []);

    const handleCloseForm = useCallback(() => {
        setOpenForm(false);
        setEditingProject(null);
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    };

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
        setOpenSnackbar(true);
        handleCloseForm();
      },
      [dispatch, handleCloseForm]
    );

  const handleDeleteProject = useCallback(async (projectId: number | undefined) => {
    await dispatch(deleteProject(projectId));
    setOpenSnackbar(true);
  }, [dispatch]);


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
          </Stack>

        <Stack direction="row" spacing={2} mb={3}>
          <TextField
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            variant="outlined"
            size="small"
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: "300px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenForm()}
            sx={{ ml: 2, borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Создать проект
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {projects
            .filter((project) =>
              project.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((project) => (
              <Grid item key={project.projectId} xs={12} sm={6} md={4}>
                <ProjectCard
                  project={project}
                  onEdit={() => handleOpenForm(project)}
                  onDelete={() => handleDeleteProject(project.projectId)}
                  onManageUsers={() => handleOpenUsers(project.projectId)}
                  isAdmin={isAdmin}
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

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          message="Операция выполнена успешно"
          action={
            <IconButton size="small" color="inherit" onClick={() => setOpenSnackbar(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    );
};

export default ProjectBoard;
