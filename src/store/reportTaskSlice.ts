export {}

// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { CreateReportTask, ReportTask } from '../types'
// import { RootState } from "./index";
// import { getToken } from "../utils/auth";
//
// // Определение начального состояния
// interface ReportsState {
// 	taskReports: ReportTask[];
// 	loading: boolean;
// 	error: string | null;
// }
//
// const initialState: ReportsState = {
// 	taskReports: [],
// 	loading: false,
// 	error: null,
// };
//
// // Получение всех отчётов задач
// export const fetchTaskReports = createAsyncThunk<ReportTask[]>(
// 	"reports/fetchTaskReports",
// 	async (_, { rejectWithValue, getState }) => {
// 		try {
// 			const state = getState() as RootState;
// 			const token = getToken(state);
//
// 			if (!token) {
// 				throw new Error("Ошибка: отсутствует токен авторизации");
// 			}
//
// 			const response = await fetch("http://localhost:4200/api/report-task", {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json",
// 					"Authorization": `Bearer ${token}`,
// 				},
// 			});
//
// 			if (!response.ok) {
// 				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
// 			}
//
// 			return await response.json();
// 		} catch (error) {
// 			console.error("Ошибка при получении отчётов задач:", error);
// 			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
// 		}
// 	}
// );
//
// // Получение отчёта задачи по ID
// export const fetchTaskReportById = createAsyncThunk<ReportTask, number>(
// 	"reports/fetchTaskReportById",
// 	async (reportId, { rejectWithValue, getState }) => {
// 		try {
// 			const state = getState() as RootState;
// 			const token = getToken(state);
//
// 			if (!token) {
// 				throw new Error("Ошибка: отсутствует токен авторизации");
// 			}
//
// 			const response = await fetch(`http://localhost:4200/api/report-task/${reportId}`, {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json",
// 					"Authorization": `Bearer ${token}`,
// 				},
// 			});
//
// 			if (!response.ok) {
// 				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
// 			}
//
// 			return await response.json();
// 		} catch (error) {
// 			console.error("Ошибка при получении отчёта задачи:", error);
// 			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
// 		}
// 	}
// );
//
// // Получение отчётов задачи по ID задачи
// export const fetchReportsByTaskId = createAsyncThunk<ReportTask[], number>(
// 	"reports/fetchReportsByTaskId",
// 	async (taskId, { rejectWithValue, getState }) => {
// 		try {
// 			const state = getState() as RootState;
// 			const token = getToken(state);
//
// 			if (!token) {
// 				throw new Error("Ошибка: отсутствует токен авторизации");
// 			}
//
// 			const response = await fetch(`http://localhost:4200/api/report-task/task/${taskId}`, {
// 				method: "GET",
// 				headers: {
// 					"Content-Type": "application/json",
// 					"Authorization": `Bearer ${token}`,
// 				},
// 			});
//
// 			if (!response.ok) {
// 				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
// 			}
//
// 			return await response.json();
// 		} catch (error) {
// 			console.error("Ошибка при получении отчётов задачи по ID задачи:", error);
// 			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
// 		}
// 	}
// );
//
// // Создание отчёта задачи
// export const createTaskReport = createAsyncThunk<ReportTask, CreateReportTask>(
// 	"reports/createTaskReport",
// 	async (reportTaskData, { rejectWithValue, getState }) => {
// 		try {
// 			const state = getState() as RootState;
// 			const token = getToken(state);
//
// 			if (!token) {
// 				throw new Error("Ошибка: отсутствует токен авторизации");
// 			}
//
// 			const response = await fetch("http://localhost:4200/api/report-task", {
// 				method: "POST",
// 				headers: {
// 					"Content-Type": "application/json",
// 					"Authorization": `Bearer ${token}`,
// 				},
// 				body: JSON.stringify(reportTaskData),
// 			});
//
// 			if (!response.ok) {
// 				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
// 			}
//
// 			return await response.json();
// 		} catch (error) {
// 			console.error("Ошибка при создании отчёта задачи:", error);
// 			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
// 		}
// 	}
// );
//
// // Обновление отчёта задачи
// export const updateTaskReport = createAsyncThunk<ReportTask, ReportTask>(
// 	"reports/updateTaskReport",
// 	async (reportTaskData, { rejectWithValue, getState }) => {
// 		try {
// 			const state = getState() as RootState;
// 			const token = getToken(state);
//
// 			if (!token) {
// 				throw new Error("Ошибка: отсутствует токен авторизации");
// 			}
//
// 			const response = await fetch(`http://localhost:4200/api/report-task/${reportTaskData.reportId}`, {
// 				method: "PATCH",
// 				headers: {
// 					"Content-Type": "application/json",
// 					"Authorization": `Bearer ${token}`,
// 				},
// 				body: JSON.stringify(reportTaskData),
// 			});
//
// 			if (!response.ok) {
// 				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
// 			}
//
// 			return await response.json();
// 		} catch (error) {
// 			console.error("Ошибка при обновлении отчёта задачи:", error);
// 			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
// 		}
// 	}
// );
//
// // Удаление отчёта задачи
// export const deleteTaskReport = createAsyncThunk<number, number>(
// 	"reports/deleteTaskReport",
// 	async (reportId, { rejectWithValue, getState }) => {
// 		try {
// 			const state = getState() as RootState;
// 			const token = getToken(state);
//
// 			if (!token) {
// 				throw new Error("Ошибка: отсутствует токен авторизации");
// 			}
//
// 			const response = await fetch(`http://localhost:4200/api/report-task/${reportId}`, {
// 				method: "DELETE",
// 				headers: {
// 					"Authorization": `Bearer ${token}`,
// 				},
// 			});
//
// 			if (!response.ok) {
// 				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
// 			}
//
// 			return reportId;
// 		} catch (error) {
// 			console.error("Ошибка при удалении отчёта задачи:", error);
// 			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
// 		}
// 	}
// );
//
// const reportsSlice = createSlice({
// 	name: "reports",
// 	initialState,
// 	reducers: {},
// 	extraReducers: (builder) => {
// 		builder
// 			.addCase(fetchTaskReports.pending, (state) => {
// 				state.loading = true;
// 			})
// 			.addCase(fetchTaskReports.fulfilled, (state, action) => {
// 				state.loading = false;
// 				state.taskReports = action.payload;
// 			})
// 			.addCase(fetchTaskReports.rejected, (state, action) => {
// 				state.loading = false;
// 				state.error = action.payload as string;
// 			})
// 			.addCase(fetchTaskReportById.pending, (state) => {
// 				state.loading = true;
// 			})
// 			.addCase(fetchTaskReportById.fulfilled, (state, action) => {
// 				state.loading = false;
// 				state.taskReports = [action.payload];
// 			})
// 			.addCase(fetchTaskReportById.rejected, (state, action) => {
// 				state.loading = false;
// 				state.error = action.payload as string;
// 			})
// 			.addCase(fetchReportsByTaskId.pending, (state) => {
// 				state.loading = true;
// 			})
// 			.addCase(fetchReportsByTaskId.fulfilled, (state, action) => {
// 				state.loading = false;
// 				state.taskReports = action.payload;
// 			})
// 			.addCase(fetchReportsByTaskId.rejected, (state, action) => {
// 				state.loading = false;
// 				state.error = action.payload as string;
// 			})
// 			.addCase(createTaskReport.fulfilled, (state, action) => {
// 				state.taskReports.push(action.payload);
// 			})
// 			.addCase(updateTaskReport.fulfilled, (state, action) => {
// 				const index = state.taskReports.findIndex((report) => report.reportId === action.payload.reportId);
// 				if (index !== -1) {
// 					state.taskReports[index] = action.payload;
// 				}
// 			})
// 			.addCase(deleteTaskReport.fulfilled, (state, action) => {
// 				state.taskReports = state.taskReports.filter((report) => report.reportId !== action.payload);
// 			});
// 	},
// });
//
// export default reportsSlice.reducer;
