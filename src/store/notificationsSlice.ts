import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../types";
import { RootState } from "./index";
import { getToken } from "../utils/auth";

interface NotificationsState {
	items: Notification[];
	loading: boolean;
	error: string | null;
}

const initialState: NotificationsState = {
	items: [],
	loading: false,
	error: null,
};

// Получение уведомлений
export const fetchNotifications = createAsyncThunk<
	Notification[],
	void,
	{ state: RootState }
>(
	'notifications/fetch',
	async (_, { getState, rejectWithValue }) => {
		try {
			const state = getState();
			const token = getToken(state);
			const email = state.auth.user?.email || localStorage.getItem('email');

			if (!email || !token) {
				throw new Error('Email или токен не найдены');
			}

			const userResponse = await fetch(`http://localhost:4200/api/users/email/${email}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!userResponse.ok) {
				throw new Error('Ошибка при получении userId');
			}

			const userData = await userResponse.json();
			const userId = userData.userId;

			if (!userId) {
				throw new Error('userId не найден в ответе');
			}

			const notificationsResponse = await fetch(`http://localhost:4200/api/notifications/${userId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!notificationsResponse.ok) {
				throw new Error('Ошибка при получении уведомлений');
			}

			return await notificationsResponse.json();
		} catch (error) {
			console.error('Ошибка fetchNotifications:', error);
			return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
		}
	}
);

// Отметить уведомление как прочитанное
export const markAsRead = createAsyncThunk<
	number,
	number, // notificationId
	{ rejectValue: string; state: RootState }
>(
	"notifications/markAsRead",
	async (notificationId, { rejectWithValue, getState }) => {
		try {
			const state = getState();
			const token = getToken(state);
			if (!token) throw new Error("Отсутствует токен авторизации");

			const response = await fetch(`http://localhost:4200/api/notifications/read/${notificationId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
			}

			return notificationId;
		} catch (error) {
			console.error("Ошибка при отметке уведомления как прочитанного:", error);
			return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
		}
	}
);

const notificationsSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(fetchNotifications.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchNotifications.rejected, (state, action) => {
				state.loading = false;
			})
			.addCase(markAsRead.fulfilled, (state, action: PayloadAction<number>) => {
				const found = state.items.find(n => n.id === action.payload);
				if (found) found.isRead = true;
			})
			.addCase(markAsRead.rejected, (state, action) => {
				state.error = action.payload ?? "Ошибка при отметке уведомления";
			});
	},
});

export default notificationsSlice.reducer;
