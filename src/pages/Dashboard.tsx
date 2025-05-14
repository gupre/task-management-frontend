import React, { useEffect, useState } from "react";
import TaskBoard from "../components/tasks/TaskBoard";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { fetchMyProjects, fetchProjects } from '../store/projectSlice'
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
import { getToken } from '../utils/auth'

const Dashboard: React.FC = () => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const projects = useSelector((state: RootState) => state.projects.items);
    const navigate = useNavigate();
    const token = useSelector(getToken);
    const email = useSelector((state: RootState) => state.auth.user?.email) || localStorage.getItem('email');

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

                if (!userId) {
                    throw new Error("Не найден userId для текущего пользователя");
                }

                if (!isAuthenticated) {
                    navigate("/login");
                } else {
                    if (userData.isAdmin) {
                        dispatch(fetchProjects());
                    } else {
                        dispatch(fetchMyProjects());
                    }
                }

            } catch (error) {
                console.error("Ошибка при получении пользователя:", error);
            }
        };

        fetchUserAndProjects();
    }, [isAuthenticated, dispatch, navigate, email, token]);

    // Обработчик выбора проекта
    const handleProjectChange = (e: SelectChangeEvent<number>) => {
        const projectId = Number(e.target.value);
        setSelectedProjectId(isNaN(projectId) ? null : projectId);
    };

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel id="project-select-label">Выберите проект</InputLabel>
                <Select
                    labelId="project-select-label"
                    value={selectedProjectId ?? ""}
                    onChange={handleProjectChange}
                    label="Выберите проект"
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 300, // Устанавливаем максимальную высоту выпадающего меню
                                overflowY: "auto", // Включаем вертикальный скроллинг
                            },
                        },
                    }}
                >
                    {projects.map((project) => (
                        <MenuItem key={project.projectId} value={project.projectId}>
                            {project.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedProjectId && <TaskBoard projectId={selectedProjectId} />}
        </div>
    );
};

export default Dashboard;
