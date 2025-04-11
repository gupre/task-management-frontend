import {jwtDecode} from "jwt-decode";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../types";
import { RootState } from "./index";
import { getToken } from "../utils/auth";

interface UserState {
    profile: User | null;
}

const initialState: UserState = {
    profile: null,
};

// Запрос для получения профиля пользователя
export const fetchUserProfile = createAsyncThunk<User, void, { state: RootState }>(
    "user/fetchUserProfile",
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const decoded: { id: number } = jwtDecode(token);
            const userId = decoded.id;

            const response = await fetch(`http://localhost:4200/api/users/${userId}`, {
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
            console.error("Ошибка при получении профиля:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);



// Запрос для обновления профиля пользователя
export const updateUserProfile = createAsyncThunk<User, Partial<User>, { state: RootState }>(
    "user/updateUserProfile",
    async (profileData, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const response = await fetch("http://localhost:4200/api/users", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Ошибка при обновлении профиля:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);

// Запрос для смены пароля
export const changePassword = createAsyncThunk<void, string, { state: RootState }>(
    "user/changePassword",
    async (newPassword, { rejectWithValue, getState }) => {
        try {
            const token = getToken(getState());
            if (!token) throw new Error("Токен отсутствует");

            const response = await fetch("http://localhost:4200/api/users/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка при смене пароля:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
        }
    }
);


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            })
    },
});

export default userSlice.reducer;
