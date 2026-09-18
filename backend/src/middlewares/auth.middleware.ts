import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../helpers/jwt.helper.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token otorisasi tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error); // Error middleware will catch TokenExpiredError etc.
  }
};

export const requireRole = (allowedRoles: ('ADMIN' | 'STAFF')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Akses ditolak: User belum terautentikasi'));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Anda tidak memiliki hak akses untuk fitur ini'));
    }
    
    next();
  };
};
