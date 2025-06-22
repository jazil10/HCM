import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import { UserRole } from '../models/User';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
      return;
    }

    next();
  };
};

export const authorizeTeamAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const { role, team: userTeam, id: userId } = req.user;
  const { teamId } = req.params;

  // Admin and HR can access all teams
  if (role === UserRole.ADMIN || role === UserRole.HR) {
    next();
    return;
  }

  // Managers can only access their own team
  if (role === UserRole.MANAGER) {
    if (userTeam !== teamId) {
      res.status(403).json({ 
        message: 'Access denied. You can only manage your own team.' 
      });
      return;
    }
    next();
    return;
  }

  // Employees can only access their own team data (read-only)
  if (role === UserRole.EMPLOYEE) {
    if (userTeam !== teamId) {
      res.status(403).json({ 
        message: 'Access denied. You can only view your own team.' 
      });
      return;
    }
    next();
    return;
  }

  res.status(403).json({ message: 'Access denied.' });
};
