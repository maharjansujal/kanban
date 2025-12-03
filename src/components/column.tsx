import { Draggable, Droppable } from "react-beautiful-dnd";
import type { Task } from "../types";

// 💡 CORRECT PROPS: Only needs ID and the pre-calculated tasks array
interface ColumnProps {
  id: string;
  columnTasks: Task[];
}

export default function Column({ id, columnTasks }: ColumnProps) {
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex flex-col w-full min-h-60 h-fit p-3 space-y-3"
        >
          {columnTasks.map((task, index) => {
            return (
              <Draggable draggableId={task.id} index={index} key={task.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="border rounded-lg flex flex-col p-3 bg-gray-700 shadow-md text-sm cursor-grab active:cursor-grabbing hover:bg-gray-600 relative" // Added "relative" here
                  >
                    <p className="font-semibold text-white">{task.title}</p>
                    <span className="text-xs text-indigo-200 mt-1">
                      ID: {task.id}
                    </span>
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
