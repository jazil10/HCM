import type { User } from "./auth";

export interface Team {
  _id: string;
  name: string;
  manager: User;
  members: User[];
}
