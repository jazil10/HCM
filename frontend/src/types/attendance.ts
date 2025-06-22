import type { Employee } from "./employee";

export interface Attendance {
  _id: string;
  employee: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday' | 'leave';
  totalHours?: number;
}
