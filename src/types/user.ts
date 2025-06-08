import { Role } from "../generated/prisma";

export interface User {
  id: string;
  name: string | null;
  role: Role;
} 