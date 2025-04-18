import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {Project, User} from "../types";
import { RootState } from "./index";
import { getToken } from "../utils/auth";
import {jwtDecode} from "jwt-decode";

interface ProjectUser {
    user: User;
}

interface ProjectState {
    users: ProjectUser[];
    items: Project[];
    loading: boolean;
}

const initialState: ProjectState = {
    users: [],
    items: [],
    loading: false,
};

// Получение списка проектов
export const fetchProjects = createAsyncThunk<Project[], void, { state: RootState }>(
    "projects/fetchProjects",
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const response = await fetch("http://localhost:4200/api/projects", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при получении проектов:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Создание проекта
export const createProject = createAsyncThunk<Project, Project, { state: RootState }>(
    "projects/createProject",
    async (projectData, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const response = await fetch("http://localhost:4200/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(projectData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при создании проекта:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Запрос для получения проектов
export const fetchMyProjects = createAsyncThunk<Project[], void, { state: RootState }>(
    "projects/fetchMyProjects",
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const decoded: { id: number } = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`http://localhost:4200/api/project-user/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // достаём только project из каждого объекта
            const projectsOnly: Project[] = data.map((entry: { project: Project }) => entry.project);

            return projectsOnly;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);


export const fetchProjectUsers = createAsyncThunk<ProjectUser[], number | undefined, { state: RootState }>(
    "projects/fetchProjectUsers",
    async (projectId: number | undefined, { rejectWithValue, getState }) => {
        try {

            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const res = await fetch(`http://localhost:4200/api/project-user/project/${projectId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Ошибка при получении пользователей");

            return await res.json();
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);


export const removeUserFromProject = createAsyncThunk <
    { projectId: number | undefined; userId: number },
    { projectId: number | undefined; userId: number },
    { state: RootState }
>(
    "projects/removeUserFromProject",
    async ({ projectId, userId }: { projectId: number | undefined, userId: number }, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const res = await fetch(`http://localhost:4200/api/projects/${projectId}/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error("Ошибка при удалении участника");
            }
            return { projectId, userId };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

// Обновление проекта
export const updateProject = createAsyncThunk<Project, Project, { state: RootState }>(
    "projects/updateProject",
    async (projectData, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const { projectId, ...updatedFields } = projectData;

            const response = await fetch(`http://localhost:4200/api/projects/${projectData.projectId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedFields),
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при обновлении проекта:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Удаление проекта
export const deleteProject = createAsyncThunk<void, number | undefined, { state: RootState }>(
    "projects/deleteProject",
    async (projectId, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const response = await fetch(`http://localhost:4200/api/projects/${projectId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении проекта:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Загрузка всех проектов
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true; // Начало загрузки
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false; // Ошибка загрузки
                // можно также сохранить ошибку, если нужно
                console.error(action.payload);
            })

            // Создание проекта
            .addCase(createProject.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                const index = state.items.findIndex((p) => p.projectId === action.payload.projectId);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.items = state.items.filter((p) => p.projectId !== action.meta.arg);
            })

            // Обработка fetchMyProjects
            .addCase(fetchMyProjects.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchMyProjects.pending, (state) => {
                state.loading = true; // Начало загрузки
            })
            .addCase(fetchMyProjects.rejected, (state, action) => {
                state.loading = false; // Ошибка загрузки
                console.error(action.payload);
            })
            .addCase(fetchProjectUsers.pending, (state) => {
                    state.loading = true;
            })
            .addCase(fetchProjectUsers.fulfilled, (state, action) => {
                state.users = action.payload;
                state.loading = false;
            })
            .addCase(fetchProjectUsers.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default projectSlice.reducer;

