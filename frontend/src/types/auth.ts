export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
} 