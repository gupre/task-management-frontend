import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import taskReducer from "./taskSlice";
import projectReducer from "./projectSlice";
import userReducer from "./userSlice";
import timeZoneReducer from "./timeZoneSlice";
import departmentReducer from "./departmentSlice";
import roleReducer from "./roleSlice";
import historyReducer from "./historySlice";

export const index = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        projects: projectReducer,
        user: userReducer,
        timeZone: timeZoneReducer,
        department: departmentReducer,
        role: roleReducer,
        history: historyReducer,
    },
});

export type RootState = ReturnType<typeof index.getState>;
export type AppDispatch = typeof index.dispatch;
