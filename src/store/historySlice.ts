import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { getToken } from "../utils/auth";
import { History } from '../types'

interface HistoryState {
	items: History[];
	loading: boolean;
	error: string | null;
}

const initialState: HistoryState = {
	items: [],
	loading: false,
	error: null,
};

export const fetchTaskHistory = createAsyncThunk<History[], number>(
	"history/fetchTaskHistory",
	async (taskId, { rejectWithValue, getState }) => {
		try {
			const state = getState() as RootState;
			const token = getToken(state);

			if (!token) {
				throw new Error("Ошибка: отсутствует токен авторизации");
			}

			const response = await fetch(`http://localhost:4200/api/task/${taskId}/history`, {
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
			console.error("Ошибка при загрузке истории задачи:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

export const historySlice = createSlice({
	name: "history",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTaskHistory.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchTaskHistory.fulfilled, (state, action: PayloadAction<History[]>) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchTaskHistory.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export default historySlice.reducer;
