import { User } from "./user";

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignedToId: string;
  createdById: string;
  checklistId: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
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