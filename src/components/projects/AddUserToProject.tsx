import React, { useState, useEffect, useMemo } from "react";
import {
    Autocomplete,
    TextField,
    Button,
    Box,
    Paper,
    Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/index";

interface UserOption {
    userId: number;
    name: string;
    email: string;
}

interface Props {
    projectId: number | undefined;
    onUserAdded?: () => void;
}

const AddUserToProject: React.FC<Props> = ({ projectId, onUserAdded }) => {
    const token = useSelector((state: RootState) => state.auth.token);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [projectUsers, setProjectUsers] = useState<UserOption[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

    useEffect(() => {
        if (!token) return;

        // Получаем всех пользователей
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:4200/api/users", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Ошибка при получении пользователей");

                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Ошибка загрузки пользователей:", error);
            }
        };

        // Получаем пользователей проекта
        const fetchProjectUsers = async () => {
            if (!projectId) return;
            try {
                const res = await fetch(
                  `http://localhost:4200/api/projects/${projectId}/users`,
                  {
                      headers: { Authorization: `Bearer ${token}` },
                  }
                );
                if (!res.ok) throw new Error("Ошибка при получении участников проекта");

                const data = await res.json();
                setProjectUsers(data);
            } catch (error) {
                console.error("Ошибка загрузки участников проекта:", error);
            }
        };

        fetchUsers();
        fetchProjectUsers();
    }, [token, projectId]);

    // Исключаем уже добавленных пользователей
    const availableUsers = useMemo(() => {
        const existingIds = new Set(projectUsers.map((u) => u.userId));
        return users.filter((u) => !existingIds.has(u.userId));
    }, [users, projectUsers]);

    const handleAdd = async () => {
        if (!selectedUser || !projectId || !token) return;

        try {
            const res = await fetch(
              `http://localhost:4200/api/projects/${projectId}/users/${selectedUser.userId}`,
              {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!res.ok) throw new Error("Ошибка при добавлении пользователя");

            onUserAdded?.();
            setSelectedUser(null);
        } catch (error) {
            console.error("Ошибка при добавлении пользователя:", error);
        }
    };

    return (
      <Paper sx={{ p: 2, borderRadius: 3 }} elevation={3}>
          <Typography variant="h6" gutterBottom>
              Добавить участника в проект
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
              <Autocomplete
                disablePortal
                options={availableUsers}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                renderInput={(params) => <TextField {...params} label="Найти и выбрать пользователя" />}
                value={selectedUser}
                onChange={(_, value) => setSelectedUser(value)}
                noOptionsText="Нет доступных пользователей"
              />

              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!selectedUser}
                sx={{ borderRadius: 2 }}
              >
                  Добавить
              </Button>
          </Box>
      </Paper>
    );
};

export default AddUserToProject;
