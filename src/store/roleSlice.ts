
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { getToken } from "../utils/auth";

export interface Role {
	id: number;
	name: string;
	usersIds?: number[];
	permissionsIds?: number[];
}

interface RoleState {
	roles: Role[];
	loading: boolean;
	error: string | null;
}

const initialState: RoleState = {
	roles: [],
	loading: false,
	error: null,
};

// Получение всех ролей
export const fetchAllRoles = createAsyncThunk<Role[], void, { state: RootState }>(
	"role/fetchAll",
	async (_, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());
			const res = await fetch("http://localhost:4200/api/role", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) throw new Error(`Ошибка ${res.status}`);

			return await res.json();
		} catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : "Ошибка при получении ролей");
		}
	}
);

// Создание новой роли
export const createRole = createAsyncThunk<Role, Partial<Role>, { state: RootState }>(
	"role/create",
	async (roleData, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());
			const res = await fetch("http://localhost:4200/api/role", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(roleData),
			});

			if (!res.ok) throw new Error(`Ошибка ${res.status}`);

			return await res.json();
		} catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : "Ошибка при создании роли");
		}
	}
);

// Обновление роли
export const updateRole = createAsyncThunk<Role, { id: number; data: Partial<Role> }, { state: RootState }>(
	"role/update",
	async ({ id, data }, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());
			const res = await fetch(`http://localhost:4200/api/role/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (!res.ok) throw new Error(`Ошибка ${res.status}`);

			return await res.json();
		} catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : "Ошибка при обновлении роли");
		}
	}
);

// Удаление роли
export const deleteRole = createAsyncThunk<number, number, { state: RootState }>(
	"role/delete",
	async (id, { rejectWithValue, getState }) => {
		try {
			const token = getToken(getState());
			const res = await fetch(`http://localhost:4200/api/role/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) throw new Error(`Ошибка ${res.status}`);
			return id;
		} catch (err) {
			return rejectWithValue(err instanceof Error ? err.message : "Ошибка при удалении роли");
		}
	}
);

const roleSlice = createSlice({
	name: "role",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAllRoles.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAllRoles.fulfilled, (state, action) => {
				state.roles = action.payload;
				state.loading = false;
			})
			.addCase(fetchAllRoles.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(createRole.fulfilled, (state, action) => {
				state.roles.push(action.payload);
			})
			.addCase(updateRole.fulfilled, (state, action) => {
				const index = state.roles.findIndex((r) => r.id === action.payload.id);
				if (index !== -1) {
					state.roles[index] = action.payload;
				}
			})
			.addCase(deleteRole.fulfilled, (state, action) => {
				state.roles = state.roles.filter((r) => r.id !== action.payload);
			});
	},
});

export default roleSlice.reducer;
