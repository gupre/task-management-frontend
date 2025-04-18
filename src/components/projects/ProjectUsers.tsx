import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Divider,
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
} from "@mui/material";
import { AppDispatch, RootState } from "../../store";
import { fetchProjectUsers } from "../../store/projectSlice";
import ProjectUserCard from "./ProjectUserCard";

interface ProjectUsersProps {
  projectId: number | undefined;
}

const ProjectUsers: React.FC<ProjectUsersProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.projects.users);
  const departments = useSelector((state: RootState) => state.department.departments);
  const loading = useSelector((state: RootState) => state.projects.loading);

  const [search, setSearch] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">("");

  useEffect(() => {
    dispatch(fetchProjectUsers(projectId));
    // Если департаменты заранее не подгружаются — нужно будет диспатчить fetchDepartments() тут
  }, [dispatch, projectId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredUsers = users.filter((u: any) => {
    const matchName = u.user.name.toLowerCase().includes(search.toLowerCase());
    const matchDepartment =
      selectedDepartmentId === "" || u.user.departmentId === selectedDepartmentId;
    return matchName && matchDepartment;
  });

  return (
    <Box mt={3}>
      <Typography variant="h5" gutterBottom>
        Участники проекта
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          fullWidth
          label="Поиск по имени"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel id="department-select-label">Департамент</InputLabel>
          <Select
            labelId="department-select-label"
            value={selectedDepartmentId}
            label="Департамент"
            onChange={(e) =>
              setSelectedDepartmentId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <MenuItem value="">Все</MenuItem>
            {departments.map((d: any) => (
              <MenuItem key={d.departmentId} value={d.departmentId}>
                {d.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Paper variant="outlined" sx={{ maxHeight: 400, overflowY: "auto", p: 2 }}>
        {filteredUsers.map((user: any) => {
          const department = departments.find((d: any) => d.departmentId === user.user.departmentId);
          const departmentName = department ? department.name : "Неизвестно";

          return (
            <ProjectUserCard
              key={user.user.userId}
              projectId={projectId}
              userId={user.user.userId}
              userName={user.user.name}
              departmentName={departmentName}
            />
          );
        })}
      </Paper>
    </Box>
  );
};

export default ProjectUsers;
