import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../helpers/response.helper.js';
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator.js';
import { UnauthorizedError } from '../errors/AppError.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await AuthService.refreshToken(refreshToken);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError('Not authenticated');
      const user = await AuthService.me(req.user.userId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
  
  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // In a more complex system, we'd blacklist the token.
      // Here we just tell the client it's successful so they delete the tokens on frontend.
      sendSuccess(res, { message: 'Berhasil logout' });
    } catch (error) {
      next(error);
    }
  }
}
