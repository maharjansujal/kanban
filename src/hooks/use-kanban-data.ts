import { useState, useEffect } from "react";
import type { DropResult } from "react-beautiful-dnd";
import type { AllTasksMap, ColumnsMap, Task } from "../types/index";

// Define the key for local storage
const LOCAL_STORAGE_KEY = "kanbanBoardData";

// Define the structure of the data saved to Local Storage for better typing
interface SavedState {
  columnsOrder: string[];
  data: ColumnsMap;
  allTasksState: AllTasksMap;
}

// --- Static Initial Data for First Run (Assumed from previous context) ---
// Note: If your initial data structure is different, please adjust this section.

const initialAllTasks: AllTasksMap = {
  "task-1": { id: "task-1", title: "Review UI/UX sketches" },
  "task-2": { id: "task-2", title: "Setup Firebase integration" },
  "task-3": { id: "task-3", title: "Implement Auth Flow" },
  "task-4": { id: "task-4", title: "Write unit tests for drag logic" },
  "task-5": { id: "task-5", title: "Documentation update for API" },
  "task-6": { id: "task-6", title: "Fix production bug related to billing" },
  "task-7": { id: "task-7", title: "Brainstorm Q3 features" },
  "task-8": { id: "task-8", title: "Refactor old service layer" },
};

const initialColumnOrder: string[] = ["column-1", "column-2", "column-3"];

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

// --- Local Storage Utilities (Existing) ---

function loadStateFromLocalStorage(): SavedState | undefined {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as SavedState;
  } catch (error) {
    console.error("Error loading state from local storage:", error);
    return undefined;
  }
}

function saveStateToLocalStorage(
  columnsOrder: string[],
  data: ColumnsMap,
  allTasksState: AllTasksMap
) {
  try {
    const serializedState = JSON.stringify({
      columnsOrder,
      data,
      allTasksState,
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
  } catch (error) {
    console.error("Error saving state to local storage:", error);
  }
}

// --- Task Utilities (Existing) ---

function createNewTask(title: string): Task {
  return {
    id: `task-${crypto.randomUUID()}`,
    title: title,
  };
}

// --- The Custom Hook ---

export function useKanbanData() {
  const savedState = loadStateFromLocalStorage();

  const [columnsOrder, setColumnsOrder] = useState<string[]>(
    savedState ? savedState.columnsOrder : initialColumnOrder
  );
  const [data, setData] = useState<ColumnsMap>(
    savedState ? savedState.data : initialColData
  );
  const [allTasksState, setAllTasksState] = useState<AllTasksMap>(
    savedState ? savedState.allTasksState : initialAllTasks
  );

  useEffect(() => {
    saveStateToLocalStorage(columnsOrder, data, allTasksState);
  }, [columnsOrder, data, allTasksState]);

  // --- Drag and Drop Handler (Omitted for brevity, but exists) ---
  function handleDragDrop(results: DropResult) {
    // ... existing handleDragDrop logic ...
     const { source, destination, type } = results;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // Handle COLUMN Dragging
    if (type === "COLUMN") {
      const reorderedColumns = [...columnsOrder];
      const [removedColId] = reorderedColumns.splice(sourceIndex, 1);
      reorderedColumns.splice(destinationIndex, 0, removedColId);
      setColumnsOrder(reorderedColumns);
    } else {
      // Handle TASK Dragging
      const sourceColId = source.droppableId;
      const destinationColumnId = destination.droppableId;

      if (sourceColId === destinationColumnId) {
        // 1. Moving within the SAME column
        const newItemsIdCollection = [...data[sourceColId].tasksOrder];
        const [deletedItemId] = newItemsIdCollection.splice(sourceIndex, 1);
        newItemsIdCollection.splice(destinationIndex, 0, deletedItemId);

        const newColumn = {
          ...data[sourceColId],
          tasksOrder: newItemsIdCollection,
        };

        const newData: ColumnsMap = {
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

        const [deletedItemId] = newSourceItemsIdCollection.splice(
          sourceIndex,
          1
        );
        newDestItemsIdCollection.splice(destinationIndex, 0, deletedItemId);

        const newSourceCol = {
          ...data[sourceColId],
          tasksOrder: newSourceItemsIdCollection,
        };
        const newDestCol = {
          ...data[destinationColumnId],
          tasksOrder: newDestItemsIdCollection,
        };

        const newData: ColumnsMap = {
          ...data,
          [sourceColId]: newSourceCol,
          [destinationColumnId]: newDestCol,
        };
        setData(newData);
      }
    }
  }


  // --- Task Management Functions ---
  
  function handleAddTask(taskTitle: string) {
    if (!taskTitle.trim()) return;

    const newTask = createNewTask(taskTitle);
    const sourceColId = "column-1"; // Always add to 'To Do'

    const newAllTasksState: AllTasksMap = {
      ...allTasksState,
      [newTask.id]: newTask,
    };

    const newItemsIdCollection = [
      newTask.id,
      ...data[sourceColId].tasksOrder,
    ];

    const newColumn = {
      ...data[sourceColId],
      tasksOrder: newItemsIdCollection,
    };

    const newData: ColumnsMap = {
      ...data,
      [sourceColId]: newColumn,
    };

    setAllTasksState(newAllTasksState);
    setData(newData);
  }

  function handleDeleteTask(taskId: string, columnId: string) {
    // 1. Remove task ID from the specific column's tasksOrder
    const columnToUpdate = data[columnId];
    const newTasksOrder = columnToUpdate.tasksOrder.filter(id => id !== taskId);

    const newColumn = {
      ...columnToUpdate,
      tasksOrder: newTasksOrder,
    };

    const newData: ColumnsMap = {
      ...data,
      [columnId]: newColumn,
    };

    // 2. Remove the task from the allTasksState map
    const { [taskId]: deletedTask, ...newAllTasksState } = allTasksState;

    // 3. Update state
    setAllTasksState(newAllTasksState);
    setData(newData);
  }

  /**
   * Updates the title of an existing task in the allTasksState map.
   * @param taskId The ID of the task to edit.
   * @param newTitle The new title for the task.
   */
  function handleEditTask(taskId: string, newTitle: string) {
    if (!newTitle.trim()) return;

    const taskToUpdate = allTasksState[taskId];
    if (!taskToUpdate) return;

    // Immutably update the single task title
    const updatedTask: Task = {
      ...taskToUpdate,
      title: newTitle.trim(),
    };

    // Immutably update the allTasksState map
    const newAllTasksState: AllTasksMap = {
      ...allTasksState,
      [taskId]: updatedTask,
    };

    setAllTasksState(newAllTasksState);
    // The useEffect hook automatically saves the state to Local Storage
  }

  // 5. Return the necessary state and functions, including the new edit function
  return {
    columnsOrder,
    data,
    allTasks: allTasksState, 
    handleDragDrop,
    handleAddTask,
    handleDeleteTask,
    handleEditTask, // New function returned
  };
}