import type { User } from "./auth";

export interface Employee {
  _id: string;
  user: User;
  employeeId: string;
  department: string;
  position: string;
  dateOfJoining: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  workLocation: string;
}
