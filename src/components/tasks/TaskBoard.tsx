import React, {useEffect, useState} from "react";
import {
    DragDropContext,
    DropResult,
} from "@hello-pangea/dnd";
import {
    Box, Typography, Button, Modal, Paper
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
    fetchTasks, deleteTask, createTask, updateTask,
} from "../../store/taskSlice";
import { Task } from "../../types";
import { FilterPanel } from "../FilterPanel/FilterPanel";
import TaskForm from "./TaskForm";
import DroppableColumn from "./DroppableColumn";

const STATUSES: Task["status"][] = ["planned", "progress", "end"];

const TaskBoard = ({ projectId }: { projectId: number }) => {
    const dispatch = useDispatch<AppDispatch>();
    const tasks = useSelector((state: RootState) => state.tasks.items);
    const [filters, setFilters] = useState({ status: "", priority: "", projectId: undefined });
    const [openForm, setOpenForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        dispatch(fetchTasks(projectId));
        console.log(projectId)
    }, [dispatch, projectId]);

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters({ ...filters, [filterName]: value });
    };

    const handleOpenForm = (task?: Task) => {
        setEditingTask(task || null);
        setOpenForm(true);
    };

    const handleCloseForm = () => setOpenForm(false);

    const handleSaveTask = (task: Task) => {
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
        (!filters.status || task.status === filters.status) &&
        (!filters.priority || task.priority === filters.priority) &&
        (!filters.projectId || task.projectId === filters.projectId)
    );

    const tasksByStatus = STATUSES.reduce((acc, status) => {
        acc[status] = filteredTasks.filter(task => task.status === status);
        return acc;
    }, {} as Record<Task["status"], Task[]>);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination || source.droppableId === destination.droppableId) return;

        const taskId = Number(draggableId);
        const task = tasks.find(t => t.taskId === taskId);
        const newStatus = destination.droppableId as Task["status"];

        if (task && task.status !== newStatus) {
            dispatch(updateTask({ ...task, status: newStatus }));
        }
    };

    // Проверяем, есть ли задачи
    const hasTasks = filteredTasks.length > 0;

    return (
        <Box sx={{ p: 3 }}>
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
            <Button variant="contained" sx={{ my: 2 }} onClick={() => handleOpenForm()}>
                Добавить задачу
            </Button>

            {hasTasks ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {STATUSES.map((status) => (
                            <DroppableColumn
                                key={status}
                                status={status}
                                tasks={tasksByStatus[status]}
                                onEdit={handleOpenForm}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </Box>
                </DragDropContext>
            ) : (
                <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center" }}>
                    Нет задач для отображения
                </Typography>
            )}

            <Modal open={openForm} onClose={handleCloseForm}>
                <Paper sx={{ p: 3, width: 400, margin: "100px auto" }}>
                    <TaskForm
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