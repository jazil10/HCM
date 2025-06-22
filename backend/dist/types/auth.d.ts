import { Request } from 'express';
export interface JwtPayload {
    id: string;
    role: string;
    team?: string;
}
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
//# sourceMappingURL=auth.d.ts.map