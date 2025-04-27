import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CreateReportProject, ReportProject } from '../types'
import { RootState } from "./index";
import { getToken } from "../utils/auth";

interface ReportsState {
	projectReports: ReportProject[];
	loading: boolean;
	error: string | null;
}

const initialState: ReportsState = {
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
			});
	},
});

export default reportsSlice.reducer;
