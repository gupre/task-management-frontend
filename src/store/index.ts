import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import taskReducer from "./taskSlice";
import projectReducer from "./projectSlice";
import userReducer from "./userSlice";
import timeZoneReducer from "./timeZoneSlice";

export const index = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        projects: projectReducer,
        user: userReducer,
        timeZone: timeZoneReducer,
    },
});

export type RootState = ReturnType<typeof index.getState>;
export type AppDispatch = typeof index.dispatch;
