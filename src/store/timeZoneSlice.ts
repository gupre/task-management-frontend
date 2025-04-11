import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { getToken } from "../utils/auth";
import { Timezone } from "../types";

interface TimezoneState {
    timezones: Timezone[];
}

const initialState: TimezoneState = {
    timezones: [],
};

// Получение всех часовых поясов
export const fetchTimezones = createAsyncThunk<Timezone[], void, { state: RootState }>(
    "timezone/fetchTimezones",
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            const response = await fetch("http://localhost:4200/api/time-zones", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error("Ошибка при получении часовых поясов:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Обновление часового пояса пользователя (удалить старый → добавить новый)
export const updateUserTimezone = createAsyncThunk<
    void,
    { oldTimezoneId: number | null; newTimezoneId: number; userId: number },
    { state: RootState }
>(
    "timezone/updateUserTimezone",
    async ({ oldTimezoneId, newTimezoneId, userId }, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());

            if (!token) throw new Error("Токен отсутствует");

            // Удаление из старой временной зоны, если была
            if (oldTimezoneId !== null) {
                await fetch(`http://localhost:4200/api/time-zones/${oldTimezoneId}/users/${userId}/remove`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            // Добавление в новую временную зону
            await fetch(`http://localhost:4200/api/time-zones/${newTimezoneId}/users/${userId}/add`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error("Ошибка при обновлении временной зоны:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

const timezoneSlice = createSlice({
    name: "timezone",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTimezones.fulfilled, (state, action) => {
                state.timezones = action.payload;
            });
        // addCase для updateUserTimezone
    },
});

export default timezoneSlice.reducer;
