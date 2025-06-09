import { User } from "./user";

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export interface TaskStatusChange {
  id: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  changedAt: Date;
  changedById: string;
  changedByName: string;
  comment?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: TaskStatus;
  assignedToId: string;
  createdById: string;
  checklistId: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  statusHistory: TaskStatusChange[];
  assignedTo: Pick<User, "id" | "name" | "role">;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  taskId: string;
  user: Pick<User, "id" | "name" | "role">;
} 