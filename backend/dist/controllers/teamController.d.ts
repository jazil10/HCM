import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
export declare const getAllTeams: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const addMemberToTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const removeMemberFromTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMyTeam: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=teamController.d.ts.map