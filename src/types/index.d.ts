export interface Task{
    id: string;
    title: string;
}

export interface ColumnData{
    id: string;
    title: string;
    tasksOrder: string[];
}

export type AllTasksMap = Record<string, Task>;
export type ColumnsMap = Record<string, ColumnData>;