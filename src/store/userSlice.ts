import {jwtDecode} from "jwt-decode";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../types";
import { RootState } from "./index";
import { getToken } from "../utils/auth";

interface UserState {
    profile: User | null;
    users: User[];
    loadingUsers: boolean;
}

const initialState: UserState = {
    profile: null,
    users: [],
    loadingUsers: false,
};

export const fetchAllUsers = createAsyncThunk<User[], void, { state: RootState }>(
  "user/fetchAllUsers",
  async (_, { rejectWithValue, getState }) => {
      try {
          const token = getToken(getState());
          if (!token) throw new Error("Токен отсутствует");

          const response = await fetch(`http://localhost:4200/api/users`, {
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
          console.error("Ошибка при получении всех пользователей:", error);
          return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
      }
  }
);


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



// // Запрос для обновления профиля пользователя
// export const updateUserProfile = createAsyncThunk<User, Partial<User>, { state: RootState }>(
//     "user/updateUserProfile",
//     async (profileData, { rejectWithValue, getState }) => {
//         try {
//             const token = getToken(getState());
//             if (!token) throw new Error("Токен отсутствует");
//
//             const response = await fetch("http://localhost:4200/api/users", {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(profileData),
//             });
//
//             if (!response.ok) {
//                 throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
//             }
//
//             return await response.json();
//         } catch (error) {
//             console.error("Ошибка при обновлении профиля:", error);
//             return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
//         }
//     }
// );

// Запрос для обновления профиля пользователя для Админа
export const updateUser = createAsyncThunk<User, { userId: number; updateData: Partial<User> }, { state: RootState }>(
  "user/updateUser",
  async ({ userId, updateData }, { rejectWithValue, getState }) => {
      try {
          const token = getToken(getState());
          if (!token) throw new Error("Токен отсутствует");

          const response = await fetch(`http://localhost:4200/api/users/${userId}`, {
              method: "PATCH",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify(updateData),
          });

          if (!response.ok) {
              throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
          }

          return await response.json();
      } catch (error) {
          console.error("Ошибка при обновлении пользователя:", error);
          return rejectWithValue(error instanceof Error ? error.message : "Неизвестная ошибка");
      }
  }
);

// Активность
export const changeUserActive = createAsyncThunk<User, { userId: number; isActive: boolean }, { state: RootState }>(
  "user/changeUserActive",
  async ({ userId, isActive }, { rejectWithValue, getState }) => {
      try {
        const token = getToken(getState());
        if (!token) throw new Error("Токен отсутствует");
        const decoded: { id: number } = jwtDecode(token);
        const adminId = decoded.id;

        const response = await fetch(`http://localhost:4200/api/users/${userId}/activate?status=${isActive}`, {
              method: "PATCH",
              headers: {
                  "Authorization": `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              throw new Error(`Ошибка ${response.status}`);
          }

          return await response.json();
      } catch (error) {
          return rejectWithValue(error instanceof Error ? error.message : "Ошибка при смене активности");
      }
  }
);

// Департамент
export const assignUserDepartment = createAsyncThunk<User, { userId: number; departmentId: number }, { state: RootState }>(
  "user/assignDepartment",
  async ({ userId, departmentId }, { rejectWithValue, getState }) => {
      try {
          const token = getToken(getState());
          const response = await fetch(`http://localhost:4200/api/users/${userId}/department/${departmentId}`, {
              method: "PATCH",
              headers: {
                  "Authorization": `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              throw new Error(`Ошибка ${response.status}`);
          }

          return await response.json();
      } catch (error) {
          return rejectWithValue(error instanceof Error ? error.message : "Ошибка при смене департамента");
      }
  }
);

// Роль (админ/не админ)
export const changeUserRole = createAsyncThunk<User, { userId: number; isAdmin: boolean }, { state: RootState }>(
  "user/changeUserRole",
  async ({ userId, isAdmin }, { rejectWithValue, getState }) => {
      try {
          const token = getToken(getState());
          const roleId = isAdmin ? 1 : 2; // или другой маппинг ролей
          const response = await fetch(`http://localhost:4200/api/users/${userId}/role/${roleId}`, {
              method: "PATCH",
              headers: {
                  "Authorization": `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              throw new Error(`Ошибка ${response.status}`);
          }

          return await response.json();
      } catch (error) {
          return rejectWithValue(error instanceof Error ? error.message : "Ошибка при смене роли");
      }
  }
);

export const checkCurrentPassword = createAsyncThunk<
  boolean,
  { userId: number; password: string },
  { state: RootState; rejectValue: string }
>(
  "user/checkPassword",
  async ({ userId, password }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState());
      const response = await fetch(`http://localhost:4200/api/users/${userId}/check-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

      const data = await response.json();
      return data.success; // предполагаем, что сервер возвращает { success: boolean }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Ошибка при проверке пароля");
    }
  }
);

export const updateUserByAdmin = createAsyncThunk<
  User,
  { userId: number; updateData: Partial<User> },
  { state: RootState }
>(
  "user/updateUserByAdmin",
  async ({ userId, updateData }, { rejectWithValue, getState }) => {
    try {
      const token = getToken(getState());
      if (!token) throw new Error("Токен отсутствует");


      const decoded: { id: number } = jwtDecode(token);
      const adminId = decoded.id;

      const response = await fetch(`http://localhost:4200/api/users/${userId}/admin-update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка при обновлении пользователя админом:", error);
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
              console.log("Profile fetched:", action.payload); // Логирование полученного профиля
              state.profile = action.payload;
          })
          .addCase(fetchAllUsers.pending, (state) => {
              console.log("Fetching all users...");
              state.loadingUsers = true;
          })
          .addCase(fetchAllUsers.fulfilled, (state, action) => {
              console.log("All users fetched:", action.payload); // Логирование всех пользователей
              state.loadingUsers = false;
              state.users = action.payload;
          })
          .addCase(fetchAllUsers.rejected, (state) => {
              console.log("Error fetching all users");
              state.loadingUsers = false;
          })
          .addCase(updateUserByAdmin.fulfilled, (state, action) => {
            const updatedUser = action.payload;
            console.log("User updated by admin:", updatedUser);
            const index = state.users.findIndex((u) => u.userId === updatedUser.userId);
            if (index !== -1) {
              state.users[index] = updatedUser;
            }
          })

          .addCase(updateUser.fulfilled, (state, action) => {
              const updatedUser = action.payload;
              console.log("User updated:", updatedUser); // Логирование обновленного пользователя
              const index = state.users.findIndex((u) => u.userId === updatedUser.userId);
              if (index !== -1) {
                  state.users[index] = updatedUser;
              }
          });
    },
});

export default userSlice.reducer;
