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
            const response = await fetch("http://localhost:4200/api/time-zones", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
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

// Создание часового пояса
export const createTimezone = createAsyncThunk<Timezone, { name: string, offset: number, users: number[] }, { state: RootState }>(
  "timezone/createTimezone",
  async ({ name, offset, users }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState());
      const response = await fetch("http://localhost:4200/api/time-zones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, offset, users }),
      });

      if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Ошибка при создании часового пояса:", error);
      return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
    }
  }
);


// Обновление часового пояса
export const updateTimezone = createAsyncThunk<Timezone, { timezoneId: number, name: string, offset: number, users: number[] }, { state: RootState }>(
  "timezone/updateTimezone",
  async ({ timezoneId, name, offset, users }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState());

      const response = await fetch(`http://localhost:4200/api/time-zones/${timezoneId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, offset, users }),
      });

      if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Ошибка при обновлении часового пояса:", error);
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
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            // Добавление в новую временную зону
            await fetch(`http://localhost:4200/api/time-zones/${newTimezoneId}/users/${userId}/add`, {
                method: "POST",
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

// Удаление часового пояса
export const deleteTimezone = createAsyncThunk<void, number, { state: RootState }>(
  "timezone/deleteTimezone",
  async (timezoneId, { rejectWithValue, getState }) => {
      try {
          const token = getToken(getState());

          const response = await fetch(`http://localhost:4200/api/time-zones/${timezoneId}`, {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
          });

          if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      } catch (error) {
          console.error("Ошибка при удалении часового пояса:", error);
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
            })
            .addCase(createTimezone.fulfilled, (state, action) => {
                state.timezones.push(action.payload);
            })
            .addCase(updateTimezone.fulfilled, (state, action) => {
              const index = state.timezones.findIndex((tz) => tz.timezoneId === action.payload.timezoneId);
              if (index !== -1) {
                  state.timezones[index] = action.payload;
              }
            })
            .addCase(deleteTimezone.fulfilled, (state, action) => {
              state.timezones = state.timezones.filter((timezone) => timezone.timezoneId !== action.meta.arg);
            })
            .addCase(updateUserTimezone.fulfilled, (state) => {
              // Можно добавить уведомление или изменить локальное состояние, если нужно
              console.log("Временная зона пользователя успешно обновлена");
            })
            .addCase(updateUserTimezone.rejected, (state, action) => {
                console.error("Ошибка при обновлении временной зоны пользователя:", action.payload);
                // Тут можно задать флаг ошибки или сообщение, если требуется
            })
    },
});

export default timezoneSlice.reducer;
