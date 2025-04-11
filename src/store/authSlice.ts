import { User } from "../types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
};

// Проверка на наличие токена в localStorage
const token = localStorage.getItem("authToken");

const initialStateWithToken = token
    ? { isAuthenticated: true, user: { email: "" }, token }
    : initialState;

const authSlice = createSlice({
    name: "auth",
    initialState: initialStateWithToken,
    reducers: {
        login(state, action: PayloadAction<{ email: string, token: string }>) {
            console.log("Login action received:", action.payload);
            state.isAuthenticated = true;
            state.user = { email: action.payload.email };
            state.token = action.payload.token; // Добавляем токен
            localStorage.setItem("authToken", action.payload.token);
            console.log("State after login:",  JSON.parse(JSON.stringify(state))); // Преобразуем состояние в обычный объект
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem("authToken");
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
