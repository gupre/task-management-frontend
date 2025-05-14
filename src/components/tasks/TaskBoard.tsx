import React, { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Box, Button, Modal, Paper, Grid, IconButton, Snackbar } from '@mui/material'
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchTasks, deleteTask, createTask, updateTask } from "../../store/taskSlice";
import { CreateTask, Task } from '../../types';
import { FilterPanel } from "../FilterPanel/FilterPanel";
import TaskForm from "./TaskForm";
import DroppableColumn from "./DroppableColumn";
import { fetchProjectUsers } from '../../store/projectSlice'
import TaskHistory from './TaskHistory'
import CloseIcon from '@mui/icons-material/Close'

const STATUSES: Task["status"][] = ["planned", "progress", "end"];

const TaskBoard = ({ projectId }: { projectId: number }) => {
    const dispatch = useDispatch<AppDispatch>();
    const tasks = useSelector((state: RootState) => state.tasks.items);
    const [openForm, setOpenForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const priorityOrder = { urgently: 1, high: 2, normal: 3, low: 4 };
    const [activeColumn, setActiveColumn] = useState<string | null>(null);

    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [filters, setFilters] = useState({ priority: "", projectId: undefined, executorId: "all", });
    const users = useSelector((state: RootState) => state.projects.users);
    const executorOptions = users
      .map(({ user }) => ({
          id: String(user.userId),
          name: user.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        dispatch(fetchTasks(projectId));
        dispatch(fetchProjectUsers(projectId));
    }, [dispatch, projectId]);

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters({ ...filters, [filterName]: value });
    };

    const handleOpenForm = (task?: Task) => {
        setEditingTask(task || null);
        setOpenForm(true);
    };

    const handleCloseForm = () => setOpenForm(false);

    const handleSaveTask = async (task: Partial<CreateTask> & { taskId?: number }) => {
        if (editingTask) {
            dispatch(updateTask(task as Task));
        } else {
            const result = await dispatch(createTask(task as CreateTask));
            if (createTask.fulfilled.match(result)) {
                await dispatch(fetchTasks(projectId));
                handleCloseForm();
            }
        }
        setOpenSnackbar(true);
    };

    const handleDeleteTask = (taskId: number | undefined) => {
        dispatch(deleteTask(taskId));
        setOpenSnackbar(true);
    };

    const filteredTasks = tasks.filter(task =>
      (!filters.priority || filters.priority === "all" || task.priority === filters.priority) &&
      (!filters.executorId || filters.executorId === "all" || String(task.userId) === filters.executorId) &&
      (!filters.projectId || task.projectId === filters.projectId)
    );

    const tasksByStatus = STATUSES.reduce((acc, status) => {
        acc[status] = filteredTasks
          .filter(task => task.status === status)
          .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        return acc;
    }, {} as Record<Task["status"], Task[]>);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        setActiveColumn(null);

        if (!destination || source.droppableId === destination.droppableId) return;

        const taskId = Number(draggableId);
        const task = tasks.find(t => t.taskId === taskId);
        const newStatus = destination.droppableId as Task["status"];

        if (task && task.status !== newStatus) {
            dispatch(updateTask({ ...task, status: newStatus }));
        }
    };

    const onDragUpdate = (update: { destination: DropResult["destination"] }) => {
        if (update.destination) {
            setActiveColumn(update.destination.droppableId);
        }
    };

    return (
      <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item>
                  <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#1976d2",
                        '&:hover': { backgroundColor: "#1565c0" },
                        borderRadius: 2
                    }}
                    onClick={() => handleOpenForm()}
                  >
                      Добавить задачу
                  </Button>
              </Grid>

              <Grid item>
                  <FilterPanel filters={filters} onFilterChange={handleFilterChange} executorOptions={executorOptions}/>
              </Grid>
          </Grid>


        <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
            <Box sx={{ display: "flex", gap: 2, mt: 3, width: "100%" }}>
                {STATUSES.map((status) => (
                  <DroppableColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    onEdit={handleOpenForm}
                    onDelete={handleDeleteTask}
                    isActive={activeColumn === status}
                  />
                ))}
            </Box>
        </DragDropContext>

          <Modal open={openForm} onClose={handleCloseForm}>
              <Paper   sx={{
                  p: 2,
                  width: "95%",
                  maxWidth: 1600,
                  margin: "80px auto",
                  borderRadius: 2,
                  boxShadow: 12,
                  maxHeight: 'calc(100vh - 100px)',
                  overflow: 'auto',
              }}>
                  <Box display="flex" gap={2}>
                      <Box flex={1}>
                          <TaskForm
                            projectId={projectId}
                            initialTask={editingTask || undefined}
                            onSave={handleSaveTask}
                            onCancel={handleCloseForm}
                          />
                      </Box>
                      {editingTask && (
                        <Box flex={1} sx={{marginTop: `30px`}}>
                            <TaskHistory taskId={editingTask.taskId} />
                        </Box>
                      )}
                  </Box>
              </Paper>
          </Modal>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            message="Операция выполнена успешно"
            action={
                <IconButton size="small" color="inherit" onClick={() => setOpenSnackbar(false)}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            }
          />
      </Box>
    );
};

export default TaskBoard;
