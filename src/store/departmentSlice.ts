import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Department } from "../types";
import { RootState } from "./index";
import { getToken } from "../utils/auth";

interface DepartmentState {
	departments: Department[];
	loading: boolean;
	error: string | null;
}

const initialState: DepartmentState = {
	departments: [],
	loading: false,
	error: null,
};


// Запрос для получения всех департаментов
export const fetchAllDepartments = createAsyncThunk<Department[], void, { state: RootState }>(
	"department/fetchAllDepartments",
	async (_, { rejectWithValue, getState }) => {
		try {
			const response = await fetch(`http://localhost:4200/api/department`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Ошибка при получении департаментов:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

// Запрос для создания департамента
export const createDepartment = createAsyncThunk<Department, { name: string; users: number[] }, { state: RootState }>(
	"department/createDepartment",
	async ({ name, users }, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());
			if (!token) throw new Error("Токен отсутствует");

			const response = await fetch("http://localhost:4200/api/department", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({ name, users }),
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Ошибка при создании департамента:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

// Запрос для обновления департамента
export const updateDepartment = createAsyncThunk<Department, { departmentId: number; name: string; users: number[] }, { state: RootState }>(
	"department/updateDepartment",
	async ({ departmentId, name, users }, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());
			if (!token) throw new Error("Токен отсутствует");

			const response = await fetch(`http://localhost:4200/api/department/${departmentId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({ name, users }),
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Ошибка при обновлении департамента:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

// Обновление департамента пользователя (удалить старый → добавить новый)
export const updateUserDepartment = createAsyncThunk<
	void,
	{ oldDepartmentId: number | null; newDepartmentId: number; userId: number },
	{ state: RootState }
>(
	"department/updateUserDepartment",
	async ({ oldDepartmentId, newDepartmentId, userId }, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());

			if (!token) throw new Error("Токен отсутствует");

			// Удаление пользователя из старого департамента, если он был
			if (oldDepartmentId !== null) {
				await fetch(`http://localhost:4200/api/department/${oldDepartmentId}/user/${userId}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
			}

			// Добавление пользователя в новый департамент
			await fetch(`http://localhost:4200/api/department/${newDepartmentId}/user/${userId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
		} catch (error) {
			console.error("Ошибка при обновлении департамента:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);


// Запрос для удаления департамента
export const deleteDepartment = createAsyncThunk<void, number, { state: RootState }>(
	"department/deleteDepartment",
	async (departmentId, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());
			if (!token) throw new Error("Токен отсутствует");

			const response = await fetch(`http://localhost:4200/api/department/${departmentId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Ошибка при удалении департамента:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);


const departmentSlice = createSlice({
	name: "department",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllDepartments.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchAllDepartments.fulfilled, (state, action) => {
				state.loading = false;
				state.departments = action.payload;
			})
			.addCase(fetchAllDepartments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(createDepartment.pending, (state) => {
				state.loading = true;
			})
			.addCase(createDepartment.fulfilled, (state, action) => {
				state.loading = false;
				state.departments.push(action.payload);
			})
			.addCase(createDepartment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateDepartment.pending, (state) => {
				state.loading = true;
			})
			.addCase(updateDepartment.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.departments.findIndex(department => department.departmentId === action.payload.departmentId);
				if (index !== -1) {
					state.departments[index] = action.payload;
				}
			})
			.addCase(updateDepartment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateUserDepartment.pending, (state) => {
				state.loading = true;
			})
			.addCase(updateUserDepartment.fulfilled, (state) => {
				state.loading = false;
				// Дополнительная логика для обновления состояния, если необходимо
			})
			.addCase(updateUserDepartment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(deleteDepartment.pending, (state) => {
				state.loading = true;
			})
			.addCase(deleteDepartment.fulfilled, (state, action) => {
				state.loading = false;
				state.departments = state.departments.filter(department => department.departmentId !== action.meta.arg);
			})
			.addCase(deleteDepartment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export default departmentSlice.reducer;
