import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../models/User';
export declare const authorize: (...allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authorizeTeamAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authorize.d.ts.map