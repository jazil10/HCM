export interface LeaveType {
  _id: string;
  name: string;
  description?: string;
  maxDaysPerYear: number;
  maxConsecutiveDays: number;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  encashmentAllowed: boolean;
  attachmentRequired: boolean;
  eligibilityMonths: number;
  applicableToGenders: ('all' | 'male' | 'female')[];
  isActive: boolean;
  color: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  WITHDRAWN = 'withdrawn'
}

export interface LeaveComment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  comment: string;
  timestamp: string;
}

export interface Leave {
  _id: string;
  employee: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    employeeId: string;
    department: string;
    position: string;
  };
  leaveType: {
    _id: string;
    name: string;
    color: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedDate?: string;
  rejectedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  rejectedDate?: string;
  rejectionReason?: string;
  attachments: string[];
  comments: LeaveComment[];
  isEmergency: boolean;
  handoverNotes?: string;
  contactDuringLeave?: {
    phone: string;
    email: string;
    address: string;
  };
  managerId?: string;
  hrComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  _id: string;
  employee: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    department: string;
    position: string;
  };
  leaveType: {
    _id: string;
    name: string;
    color: string;
    maxDaysPerYear: number;
  };
  year: number;
  allocated: number;
  used: number;
  pending: number;
  carriedForward: number;
  encashed: number;
  remaining: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  isEmergency?: boolean;
  handoverNotes?: string;
  contactDuringLeave?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

export interface LeaveFilters {
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  leaveType?: string;
  page?: number;
  limit?: number;
}

export interface LeaveBalanceSummary {
  _id: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  totalAllocated: number;
  totalUsed: number;
  totalPending: number;
  totalRemaining: number;
  employeeCount: number;
  utilizationPercentage: number;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  type: 'national' | 'religious' | 'company' | 'optional';
  applicableTo: ('all' | 'male' | 'female')[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
