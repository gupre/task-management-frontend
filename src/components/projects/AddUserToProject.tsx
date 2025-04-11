import React, { useState, useEffect } from "react";
import {Autocomplete, TextField, Button, Box} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
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
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

    useEffect(() => {
        if (!token) return; // Если токен отсутствует, запрос не выполняем
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:4200/api/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Ошибка при получении пользователей");

                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Ошибка загрузки пользователей:", error);
            }
        };

        fetchUsers();
    }, [token]);

    // Обработка добавления пользователя в проект
    const handleAdd = async () => {
        if (!selectedUser || !projectId || !token) return;

        try {
            const res = await fetch(`http://localhost:4200/api/user/projects/${projectId}/users/${selectedUser.userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Ошибка при добавлении пользователя");

            onUserAdded?.(); // Вызов коллбэка после добавления
            setSelectedUser(null); // Очистка выбранного пользователя
        } catch (error) {
            console.error("Ошибка при добавлении пользователя:", error);
        }
    };

    return (
        <Box display="flex" gap={2} alignItems="center">
            <Autocomplete sx={{ width: 300 }}
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                renderInput={(params) => <TextField {...params} label="Добавить участника" />}
                value={selectedUser}
                onChange={(_, value) => setSelectedUser(value)}
            />
            <Button variant="contained" onClick={handleAdd} disabled={!selectedUser}>
                Добавить
            </Button>
        </Box>
);
};

export default AddUserToProject;
