import React from "react";
import {
    Droppable,
    DroppableProvided,
} from "@hello-pangea/dnd";
import { Box, Typography, Badge } from "@mui/material";
import { Task } from "../../types";
import DraggableTaskCard from "./DraggableTaskCard";

interface Props {
    status: Task["status"];
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (taskId: number | undefined) => void;
    isActive?: boolean;
}

const statusLabels: Record<Task["status"], string> = {
    planned: "Запланировано",
    progress: "В процессе",
    end: "Завершено",
};

const DroppableColumn: React.FC<Props> = ({ status, tasks, onEdit, onDelete, isActive }) => {
    return (
      <Droppable droppableId={status}>
          {(provided: DroppableProvided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                  minHeight: "500px",
                  p: 2,
                  bgcolor: isActive ? "#e3f2fd" : "#f4f6f8", // подсветка активной колонки
                  borderRadius: 2,
                  border: isActive ? "2px solid #2196f3" : "1px solid #ddd", // рамка
                  flex: 1,
                  transition: "0.3s",
                  position: "relative",
              }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">{statusLabels[status]}</Typography>

                    <Badge
                      badgeContent={tasks.length}
                      color="primary"
                      sx={{ position: "absolute", top: 0, right: 0 }}
                    />

                </Box>

                {tasks.map((task, index) => (
                  <DraggableTaskCard
                    key={task.taskId}
                    task={task}
                    index={index}
                    onEdit={() => onEdit(task)}
                    onDelete={() => onDelete(task.taskId)}
                  />
                ))}

                {tasks.length === 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 2 }}>
                      Нет задач в этом статусе
                  </Typography>
                )}

                {provided.placeholder}
            </Box>
          )}
      </Droppable>
    );
};

export default DroppableColumn;
