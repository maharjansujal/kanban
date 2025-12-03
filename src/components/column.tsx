import { Draggable, Droppable } from "react-beautiful-dnd";
import type { Task } from "../types";

// Update props to include the delete handler
interface ColumnProps {
  id: string;
  columnTasks: Task[];
  // New prop: function to handle task deletion
  onDeleteTask: (taskId: string, columnId: string) => void;
}

export default function Column({ id, columnTasks, onDeleteTask }: ColumnProps) {
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
                    className="border rounded-xl flex flex-col p-4 bg-gray-700 text-sm cursor-grab active:cursor-grabbing relative"
                  >
                    {/* Task Content */}
                    <div className="flex justify-between items-start w-full">
                      <p className="font-semibold text-white text-base pr-8">
                        {task.title}
                      </p>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent drag interaction when clicking delete
                          onDeleteTask(task.id, id);
                        }}
                        className="text-red-400 ml-2 p-1 rounded-full absolute top-2 right-2"
                        title="Delete Task"
                      >
                        {/* Inline SVG for a clean close icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>

                    <span className="text-xs text-indigo-300 mt-2 opacity-75">
                      ID: {task.id.substring(0, 10)}...
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
