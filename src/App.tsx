import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import Column from "./components/column";
import { useKanbanData } from "./hooks/use-kanban-data";

export default function App() {
  // Pull handleEditTask from the hook return
  const {
    columnsOrder,
    data,
    allTasks,
    handleDragDrop,
    handleAddTask,
    handleDeleteTask,
    handleEditTask,
  } = useKanbanData();

  return (
    <DragDropContext onDragEnd={handleDragDrop}>
      <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-white font-inter">
          Kanban Board (Local Storage)
        </h1>

        {/* New Task Input & Button */}
        <div className="mb-8 flex space-x-3 w-full max-w-4xl">
          <input
            id="newTaskInput"
            type="text"
            placeholder="Enter new task title..."
            className="flex-grow p-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-500 shadow-inner"
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                "newTaskInput"
              ) as HTMLInputElement;
              handleAddTask(input.value);
              input.value = ""; // Clear input after adding
            }}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Add Task
          </button>
        </div>
        {/* End New Task Input & Button */}

        <Droppable droppableId="ROOT" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex overflow-x-auto justify-start items-start w-full max-w-full lg:max-w-7xl pb-4"
              style={{ minHeight: "calc(100vh - 180px)" }}
            >
              {columnsOrder.map((colId, index) => {
                const columnData = data[colId];
                // Map the task IDs in the column to the actual task objects
                const columnTasks = columnData.tasksOrder
                  .map((taskId) => allTasks[taskId])
                  .filter((task) => task !== undefined); // Filter out tasks that might not exist in allTasks

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
                        // REMOVED: transition duration-300, hover:shadow-indigo-500/30
                        className="flex flex-col p-3 mx-2 bg-gray-800 rounded-xl min-w-[300px] max-w-[300px] shadow-2xl"
                        style={{
                          ...provided.draggableProps.style,
                          position: "relative",
                        }}
                      >
                        <div
                          {...provided.dragHandleProps}
                          // REMOVED: hover:bg-gray-600, transition duration-150
                          className="bg-gray-700 p-3 rounded-t-xl cursor-grab active:cursor-grabbing flex justify-between items-center"
                        >
                          <p className="text-lg font-bold text-white uppercase tracking-wider">
                            {columnData.title}
                          </p>
                          <span className="text-sm font-medium text-indigo-400 bg-indigo-900/50 px-2 py-0.5 rounded-full">
                            {columnTasks.length}
                          </span>
                        </div>

                        {/* Pass the column ID, delete handler, AND the new edit handler */}
                        <Column
                          id={columnData.id}
                          columnTasks={columnTasks}
                          onDeleteTask={handleDeleteTask}
                          onEditTask={handleEditTask} // New prop passed down
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
