import { Request } from 'express';
import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { UserRole } from '../models/User';

// Extend the base JwtPayload from jsonwebtoken
export interface JwtPayload extends BaseJwtPayload {
  id: string;
  role: UserRole;
  employeeId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}