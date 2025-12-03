import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Column from "./components/column";
import type { DropResult } from "react-beautiful-dnd";
import type { AllTasksMap, ColumnsMap } from "./types";

// Static data for all tasks (Typed to prevent 'any' index error)
const allTasks: AllTasksMap = {
  "task-1": { id: "task-1", title: "Review UI/UX sketches" },
  "task-2": { id: "task-2", title: "Setup Firebase integration" },
  "task-3": { id: "task-3", title: "Implement Auth Flow" },
  "task-4": { id: "task-4", title: "Write unit tests for drag logic" },
  "task-5": { id: "task-5", title: "Documentation update for API" },
  "task-6": { id: "task-6", title: "Fix production bug related to billing" },
  "task-7": { id: "task-7", title: "Brainstorm Q3 features" },
  "task-8": { id: "task-8", title: "Refactor old service layer" },
};

const initialColumnOrder = ["column-1", "column-2", "column-3"];

const initialColData: ColumnsMap = {
  "column-1": {
    id: "column-1",
    title: "To Do",
    tasksOrder: ["task-1", "task-2", "task-3"],
  },
  "column-2": {
    id: "column-2",
    title: "In Progress",
    tasksOrder: ["task-4", "task-5"],
  },
  "column-3": {
    id: "column-3",
    title: "Done",
    tasksOrder: ["task-6", "task-7", "task-8"],
  },
};

export default function App() {
  const [columnsOrder, setColumnsOrder] = useState(initialColumnOrder);
  const [data, setData] = useState(initialColData);

  function handleDragDrop(results: DropResult) {
    const { source, destination, type } = results;

    if (!destination) return;

    // If the item was dropped in the exact same position, do nothing.
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // Handle COLUMN Dragging (reordering the columns)
    if (type === "COLUMN") {
      const reorderedColumns = [...columnsOrder];
      const [removedColId] = reorderedColumns.splice(sourceIndex, 1);
      reorderedColumns.splice(destinationIndex, 0, removedColId);

      setColumnsOrder(reorderedColumns);
      return;
    } else {
      // Handle TASK Dragging
      const sourceColId = source.droppableId;
      const destinationColumnId = destination.droppableId;

      // 1. Moving within the SAME column
      if (sourceColId === destinationColumnId) {
        const newItemsIdCollection = [...data[sourceColId].tasksOrder];
        const [deletedItemId] = newItemsIdCollection.splice(sourceIndex, 1);
        newItemsIdCollection.splice(destinationIndex, 0, deletedItemId);

        // Immutability: Create a NEW column object (Level 2)
        const newColumn = {
          ...data[sourceColId],
          tasksOrder: newItemsIdCollection,
        };

        // Immutability: Create a NEW data object (Level 1)
        const newData = {
          ...data,
          [sourceColId]: newColumn,
        };

        setData(newData);
      } else {
        // 2. Moving between DIFFERENT columns
        const newSourceItemsIdCollection = [...data[sourceColId].tasksOrder];
        const newDestItemsIdCollection = [
          ...data[destinationColumnId].tasksOrder,
        ];

        // Remove from source array
        const [deletedItemId] = newSourceItemsIdCollection.splice(
          sourceIndex,
          1
        );

        // Insert into destination array
        newDestItemsIdCollection.splice(destinationIndex, 0, deletedItemId);

        // Immutability: Create NEW column objects for both source and destination (Level 2)
        const newSourceCol = {
          ...data[sourceColId],
          tasksOrder: newSourceItemsIdCollection,
        };
        const newDestCol = {
          ...data[destinationColumnId],
          tasksOrder: newDestItemsIdCollection,
        };

        // Immutability: Create a NEW data object (Level 1)
        const newData = {
          ...data,
          [sourceColId]: newSourceCol,
          [destinationColumnId]: newDestCol,
        };

        setData(newData);
      }
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragDrop}>
      <Droppable droppableId="ROOT" type="COLUMN" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex overflow-x-auto justify-start min-h-[70vh] max-w-full z-10 gap-4" // Added gap to manage spacing
          >
            {columnsOrder.map((colId, index) => {
              const columnData = data[colId];
              const columnTasks = columnData.tasksOrder.map(
                (taskId) => allTasks[taskId]
              );

              return (
                <Draggable
                  draggableId={columnData.id}
                  key={columnData.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex flex-col p-3 mx-2 bg-gray-700 rounded-md min-w-[280px] max-w-[320px] shadow-lg"
                      style={{
                        ...provided.draggableProps.style,
                        position: "relative",
                        zIndex: 10,
                      }}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="bg-gray-600 hover:bg-gray-500 p-2 rounded-t-md cursor-move"
                      >
                        <p className="text-xl font-semibold text-white">
                          {columnData.title}
                        </p>
                      </div>

                      <Column id={columnData.id} columnTasks={columnTasks} />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
