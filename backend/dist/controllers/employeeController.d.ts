import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare const createEmployee: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllEmployees: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getEmployeeById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateEmployee: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteEmployee: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getEmployeeByUserId: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMyEmployeeProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=employeeController.d.ts.map