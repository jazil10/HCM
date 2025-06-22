import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare const getAllUsers: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserById: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTeamMembers: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map