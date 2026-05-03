import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth-service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login.' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please login again.' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Authentication failed.' 
    });
  }
}

/**
 * Require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required.' 
    });
  }
  next();
}

