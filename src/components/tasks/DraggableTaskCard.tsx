import React from "react";
import {
    Draggable,
    DraggableProvided,
} from "@hello-pangea/dnd";
import { Task } from "../../types";
import { TaskCard } from "./TaskCard";

interface Props {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number | undefined) => void;
}

const DraggableTaskCard: React.FC<Props> = ({ task, index, onEdit, onDelete }) => {
    return (
        <Draggable draggableId={task.taskId!.toString()} index={index}>
            {(provided: DraggableProvided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        ...provided.draggableProps.style,
                        marginBottom: 8,
                    }}
                >
                    <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
                </div>
            )}
        </Draggable>
    );
};

export default DraggableTaskCard;
