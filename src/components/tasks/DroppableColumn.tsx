import React from "react";
import {
    Droppable,
    DroppableProvided,
} from "@hello-pangea/dnd";
import { Box, Typography } from "@mui/material";
import { Task } from "../../types";
import DraggableTaskCard from "./DraggableTaskCard";

interface Props {
    status: Task["status"];
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (taskId: number | undefined) => void;
}

const statusLabels: Record<Task["status"], string> = {
    planned: "Запланировано",
    progress: "В процессе",
    end: "Завершено",
};

const DroppableColumn: React.FC<Props> = ({ status, tasks, onEdit, onDelete }) => {
    return (
        <Droppable droppableId={status}>
            {(provided: DroppableProvided) => (
                <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                        minHeight: "500px",
                        p: 2,
                        bgcolor: "#f4f6f8",
                        borderRadius: 2,
                        border: "1px solid #ddd",
                        flexGrow: 1,
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {statusLabels[status]}
                    </Typography>

                    {tasks.map((task, index) => (
                        <DraggableTaskCard
                            key={task.taskId}
                            task={task}
                            index={index}
                            onEdit={() => onEdit(task)}  // Передаем task в onEdit
                            onDelete={() => onDelete(task.taskId)}  // Передаем taskId в onDelete
                        />
                    ))}

                    {provided.placeholder}
                </Box>
            )}
        </Droppable>
    );
};

export default DroppableColumn;
