import React, { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Box, Typography, Button, Modal, Paper, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchTasks, deleteTask, createTask, updateTask } from "../../store/taskSlice";
import { CreateTask, Task } from '../../types';
import { FilterPanel } from "../FilterPanel/FilterPanel";
import TaskForm from "./TaskForm";
import DroppableColumn from "./DroppableColumn";
import { fetchProjectUsers } from '../../store/projectSlice'

const STATUSES: Task["status"][] = ["planned", "progress", "end"];

const TaskBoard = ({ projectId }: { projectId: number }) => {
    const dispatch = useDispatch<AppDispatch>();
    const tasks = useSelector((state: RootState) => state.tasks.items);
    const [openForm, setOpenForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const priorityOrder = { urgently: 1, high: 2, normal: 3, low: 4 };
    const [activeColumn, setActiveColumn] = useState<string | null>(null);


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

    const handleSaveTask = (task: CreateTask) => {
        if (editingTask) {
            dispatch(updateTask(task));
        } else {
            dispatch(createTask(task));
        }
        handleCloseForm();
    };

    const handleDeleteTask = (taskId: number | undefined) => {
        dispatch(deleteTask(taskId));
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
              <Paper sx={{ p: 3, width: 400, margin: "100px auto", borderRadius: 2, boxShadow: 24 }}>
                  <TaskForm
                    projectId={projectId}
                    initialTask={editingTask || undefined}
                    onSave={handleSaveTask}
                    onCancel={handleCloseForm}
                  />
              </Paper>
          </Modal>
      </Box>
    );
};

export default TaskBoard;
