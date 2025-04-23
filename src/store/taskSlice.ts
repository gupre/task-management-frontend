import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CreateTask, Task } from '../types'
import { RootState } from "./index";
import { getToken } from "../utils/auth";
import { jwtDecode } from 'jwt-decode'

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
export const createTask = createAsyncThunk<Task, CreateTask>(
    "tasks/createTask",
    async (taskData, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = getToken(state);

            if (!token) throw new Error("Токен отсутствует");

            const decoded: { id: number } = jwtDecode(token);
            const userId = decoded.id;

            if (!token) {
                throw new Error("Ошибка: отсутствует токен авторизации");
            }

            const response = await fetch(`http://localhost:4200/api/task/user/${userId}'`, {
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

export const assignUserToTask = createAsyncThunk<Task, { taskId: number; userId: number }>(
  "tasks/assignUserToTask",
  async ({ taskId, userId }, { rejectWithValue, getState }) => {
      try {
          const state = getState() as RootState;
          const token = getToken(state);

          if (!token) {
              throw new Error("Ошибка: отсутствует токен авторизации");
          }

          const decoded: { id: number } = jwtDecode(token);
          const createUserId = decoded.id;

          const response = await fetch(`http://localhost:4200/api/task/${taskId}/assign/${userId}/user/${createUserId}`, {
              method: "PATCH",
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
          console.error("Ошибка при назначении пользователя:", error);
          return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
      }
  }
);


// Обновление задачи
export const updateTask = createAsyncThunk<Task, Task | CreateTask>(
  "tasks/updateTask",
  async (taskData, { rejectWithValue, getState }) => {
      try {
          const state = getState() as RootState;
          const token = getToken(state);

          if (!token) {
              throw new Error("Ошибка: отсутствует токен авторизации");
          }

          const decoded: { id: number } = jwtDecode(token);
          const createUserId = decoded.id;

          let taskId: number | undefined;
          let assignmentDate: string | undefined;
          let rest: any = {}; // временно any, если нужно точно — можно через типы сделать

          if ('user' in taskData && 'history' in taskData && 'reports' in taskData) {
              const { taskId: _taskId, assignmentDate: _assignmentDate, user, history, reports, ...other } = taskData;
              taskId = _taskId;
              assignmentDate = _assignmentDate;
              rest = other;
          } else {
              const { taskId: _taskId, assignmentDate: _assignmentDate, ...other } = taskData;
              taskId = _taskId;
              assignmentDate = _assignmentDate;
              rest = other;
          }


          const payload: any = {
              ...rest,
              userId: taskData.userId,
          };

          // Убираем лишнее
          if ('project' in payload) {
              delete payload.project;
          }

          if (
            assignmentDate &&
            typeof assignmentDate === "string" &&
            !isNaN(Date.parse(assignmentDate))
          ) {
              payload.assignmentDate = assignmentDate;
          } else {
              payload.assignmentDate = new Date().toISOString().slice(0, 10);
          }

          // Проверяем наличие history и reports, только если это Task
          if ("history" in taskData && Array.isArray(taskData.history)) {
              payload.historyIds = taskData.history.map(h => h.historyId);
          }

          if ("reports" in taskData && Array.isArray(taskData.reports)) {
              payload.reportIds = taskData.reports.map(r => r.reportId);
          }

          const response = await fetch(`http://localhost:4200/api/task/${taskId}/user/${createUserId}`, {
              method: "PATCH",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
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

export const updateTaskOrder = createAsyncThunk<number[], number[] >(
  "tasks/updateOrder",
  async (taskIds, { rejectWithValue, getState }) => {
      try {
          const state = getState() as RootState;
          const token = getToken(state);

          if (!token) {
              throw new Error("Ошибка: отсутствует токен авторизации");
          }

          const response = await fetch(`http://localhost:4200/api/task/order`, {
              method: "PATCH",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ taskIds }),
          });

          if (!response.ok) {
              throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
          }

          return taskIds;
      } catch (error) {
          console.error("Ошибка при обновлении порядка задач:", error);
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
            .addCase(assignUserToTask.fulfilled, (state, action) => {
              const index = state.items.findIndex((t) => t.taskId === action.payload.taskId);
              if (index !== -1) {
                  state.items[index] = action.payload;
              }
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
