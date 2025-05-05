import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CreateReportProject, ReportProject, TaskForGantt, TeamMemberReport, WeeklyWorkload } from '../types'
import { RootState } from "./index";
import { getToken } from "../utils/auth";

interface ReportsState {
	tasksForGantt: TaskForGantt[];
	projectReports: ReportProject[];
	loading: boolean;
	error: string | null;
}

const initialState: ReportsState = {
	tasksForGantt: [],
	projectReports: [],
	loading: false,
	error: null,
};

// Получение отчётов проектов
export const fetchProjectReports = createAsyncThunk<ReportProject[], { projectId?: number, startDate?: string, endDate?: string }>(
	"reports/fetchProjectReports",
	async ({ projectId, startDate, endDate }, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			let url = "http://localhost:4200/api/report-project";

			if (projectId !== undefined) {
				url = `http://localhost:4200/api/report-project/project/${projectId}`;
			}

			// Добавляем параметры для фильтрации по датам, если они переданы
			const params: any = {};
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			const queryParams = new URLSearchParams(params).toString();
			if (queryParams) {
				url += `?${queryParams}`;
			}

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
			console.error("Ошибка при получении отчётов проектов:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

export const fetchTasksForGantt = createAsyncThunk<TaskForGantt[], number>(
	'reportProject/fetchTasksForGantt',
	async (projectId: number, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			const response = await fetch(`/api/report-project/project/${projectId}/tasks-for-gantt`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (!response.ok) {
				throw new Error('Ошибка при загрузке задач для диаграммы Ганта');
			}
			return response.json();

		} catch(error) {
			console.error("Ошибка при получении задач проекта для диаграммы Ганнта:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);


// Создание отчёта проекта
export const createProjectReport = createAsyncThunk<ReportProject, CreateReportProject>(
	"reports/createProjectReport",
	async (reportProjectData, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			const response = await fetch("http://localhost:4200/api/report-project", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify(reportProjectData),
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Ошибка при создании отчёта проекта:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

export const fetchWorkloadReport = createAsyncThunk<WeeklyWorkload[], { projectId: number, startDate?: string, endDate?: string }>(
	"reports/fetchWorkloadReport",
	async ({ projectId, startDate, endDate }, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			let url = `http://localhost:4200/api/project/${projectId}/workload`;

			// Добавляем параметры для фильтрации по датам, если они переданы
			const params: any = {};
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			const queryParams = new URLSearchParams(params).toString();
			if (queryParams) {
				url += `?${queryParams}`;
			}

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
			console.error("Ошибка при получении отчёта по нагрузке:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

export const fetchTeamMemberReport = createAsyncThunk<TeamMemberReport[], number>(
	"reports/fetchTeamMemberReport",
	async (projectId, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			const url = `http://localhost:4200/api/project/${projectId}/team-report`;

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
			console.error("Ошибка при получении отчёта по сотрудникам:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);


// Обновление отчёта проекта
export const updateProjectReport = createAsyncThunk<ReportProject, ReportProject>(
	"reports/updateProjectReport",
	async (reportProjectData, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			const response = await fetch(`http://localhost:4200/api/report-project/${reportProjectData.reportId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify(reportProjectData),
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Ошибка при обновлении отчёта проекта:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

// Удаление отчёта проекта
export const deleteProjectReport = createAsyncThunk<number, number>(
	"reports/deleteProjectReport",
	async (reportId, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			const response = await fetch(`http://localhost:4200/api/report-project/${reportId}`, {
				method: "DELETE",
				headers: {
					"Authorization": `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}

			return reportId;
		} catch (error) {
			console.error("Ошибка при удалении отчёта проекта:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

export const reportsSlice = createSlice({
	name: "reports",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProjectReports.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchProjectReports.fulfilled, (state, action) => {
				state.loading = false;
				state.projectReports = action.payload;
			})
			.addCase(fetchProjectReports.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// Обработка запросов Workload Report
			.addCase(fetchWorkloadReport.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchWorkloadReport.fulfilled, (state, action) => {
				state.loading = false;
				// Обработка данных отчёта по нагрузке
				// Например, сохранение их в отдельном поле или в том же массиве projectReports
			})
			.addCase(fetchWorkloadReport.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})

			// Обработка запросов Team Member Report
			.addCase(fetchTeamMemberReport.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchTeamMemberReport.fulfilled, (state, action) => {
				state.loading = false;
				// Обработка данных отчёта по сотрудникам
				// Например, можно сохранять в новое поле state.teamMemberReports
			})
			.addCase(fetchTeamMemberReport.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(createProjectReport.fulfilled, (state, action) => {
				state.projectReports.push(action.payload);
			})
			.addCase(updateProjectReport.fulfilled, (state, action) => {
				const index = state.projectReports.findIndex((report) => report.reportId === action.payload.reportId);
				if (index !== -1) {
					state.projectReports[index] = action.payload;
				}
			})
			.addCase(deleteProjectReport.fulfilled, (state, action) => {
				state.projectReports = state.projectReports.filter((report) => report.reportId !== action.payload);
			})
			.addCase(fetchTasksForGantt.fulfilled, (state, action) => {
					console.log("Fetched tasks for Gantt in Redux:", action.payload);
					state.tasksForGantt = action.payload;
				})
	},
});

export default reportsSlice.reducer;
