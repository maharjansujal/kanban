import { Draggable, Droppable } from "react-beautiful-dnd";
import React, { useState } from "react";
import type { Task } from "../types";

// Update props to include the edit handler
interface ColumnProps {
  id: string;
  columnTasks: Task[];
  onDeleteTask: (taskId: string, columnId: string) => void;
  // New prop: function to handle task editing
  onEditTask: (taskId: string, newTitle: string) => void;
}

export default function Column({
  id,
  columnTasks,
  onDeleteTask,
  onEditTask,
}: ColumnProps) {
  // State to track the ID of the task currently in edit mode
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  // State to hold the current draft title while editing
  const [draftTitle, setDraftTitle] = useState("");

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setDraftTitle(task.title);
  };

  const handleSaveEdit = (taskId: string) => {
    if (draftTitle.trim()) {
      onEditTask(taskId, draftTitle);
    }
    setEditingTaskId(null);
    setDraftTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(taskId);
    }
    if (e.key === "Escape") {
      setEditingTaskId(null);
      setDraftTitle("");
    }
  };

  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex flex-col w-full min-h-60 h-fit p-3 space-y-3"
        >
          {columnTasks.map((task, index) => {
            const isEditing = editingTaskId === task.id;

            return (
              <Draggable draggableId={task.id} index={index} key={task.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    // Disable drag handle when editing so the input field can be used
                    {...(isEditing ? {} : provided.dragHandleProps)}
                    className="border rounded-xl flex flex-col p-4 bg-gray-700 text-sm cursor-grab active:cursor-grabbing relative"
                    // Double-click to start editing
                    onDoubleClick={() => handleStartEdit(task)}
                  >
                    <div className="flex justify-between items-start w-full">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onBlur={() => handleSaveEdit(task.id)}
                          onKeyDown={(e) => handleKeyDown(e, task.id)}
                          autoFocus
                          className="w-full text-white bg-gray-600 border border-indigo-400 rounded-lg p-1 focus:ring-0 focus:outline-none"
                        />
                      ) : (
                        <p className="font-semibold text-white text-base pr-8">
                          {task.title}
                        </p>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent drag interaction when clicking delete
                          onDeleteTask(task.id, id);
                        }}
                        className="text-red-400 ml-2 p-1 rounded-full absolute top-2 right-2"
                        title="Delete Task"
                      >
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
