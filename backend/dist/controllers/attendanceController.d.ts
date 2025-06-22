import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare const clockIn: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const clockOut: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAttendance: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTodayAttendance: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateAttendance: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAttendanceSummary: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=attendanceController.d.ts.map