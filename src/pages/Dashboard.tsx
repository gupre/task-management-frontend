import React, { useEffect, useState } from "react";
import TaskBoard from "../components/tasks/TaskBoard";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { useNavigate } from "react-router-dom";
import { fetchMyProjects } from "../store/projectSlice";
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";

const Dashboard: React.FC = () => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const projects = useSelector((state: RootState) => state.projects.items);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        } else {
            dispatch(fetchMyProjects());
        }
    }, [isAuthenticated, dispatch, navigate]);

    // Обработчик выбора проекта
    const handleProjectChange = (e: SelectChangeEvent<number>) => {
        const projectId = Number(e.target.value);
        setSelectedProjectId(isNaN(projectId) ? null : projectId);
    };

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel>Выберите проект</InputLabel>
                <Select
                    value={selectedProjectId ?? ""}
                    onChange={handleProjectChange}
                    label="Выберите проект"
                    displayEmpty
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
