import { RootState } from "../store";

export const getToken = (state: RootState): string | null => {
    return state.auth.token ?? localStorage.getItem("authToken");
};
