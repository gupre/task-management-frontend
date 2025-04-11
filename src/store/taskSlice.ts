import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../types";
import { RootState } from "./index";
import { getToken } from "../utils/auth";

interface TaskState {
    items: Task[];
    loading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    items: [],
    loading: false,
    error: null,
};

// Получение задач
export const fetchTasks = createAsyncThunk<Task[], number | undefined>(
    "tasks/fetchTasks",
    async (projectId, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = getToken(state);

            if (!token) {
                throw new Error("Ошибка: отсутствует токен авторизации");
            }

            const url = projectId !== undefined
                ? `http://localhost:4200/api/task/project/${projectId}`
                : "http://localhost:4200/api/task";

            const response = await fetch(url, {
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
            console.error("Ошибка при получении задач:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Создание задачи
export const createTask = createAsyncThunk<Task, Task>(
    "tasks/createTask",
    async (taskData, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = getToken(state);

            if (!token) {
                throw new Error("Ошибка: отсутствует токен авторизации");
            }

            const response = await fetch("http://localhost:4200/api/task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при создании задачи:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Обновление задачи
export const updateTask = createAsyncThunk<Task, Task>(
    "tasks/updateTask",
    async (taskData, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = getToken(state);

            if (!token) {
                throw new Error("Ошибка: отсутствует токен авторизации");
            }

            const { taskId, user, history, reports, ...taskWithoutExtras  } = taskData;

            const payload = {
                ...taskWithoutExtras,
                userId: taskData.userId ?? user?.userId,
                historyIds: taskData.history?.map(h => h.historyId),
                reportIds: taskData.reports?.map(r => r.reportId)
            };

            const response = await fetch(`http://localhost:4200/api/task/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload ),
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при обновлении задачи:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Удаление задачи
export const deleteTask = createAsyncThunk<number | undefined, number | undefined>(
    "tasks/deleteTask",
    async (taskId, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = getToken(state);

            if (!token) {
                throw new Error("Ошибка: отсутствует токен авторизации");
            }

            const response = await fetch(`http://localhost:4200/api/task/${taskId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            return taskId;
        } catch (error) {
            console.error("Ошибка при удалении задачи:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

export const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.items.findIndex((t) => t.taskId === action.payload.taskId);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.items = state.items.filter((task) => {
                    const taskId = typeof task.taskId === "string" ? Number(task.taskId) : task.taskId;
                    const actionId = typeof action.meta.arg === "string" ? Number(action.meta.arg) : action.meta.arg;
                    return taskId !== actionId;
                });
            });
    },
});

export default taskSlice.reducer;
