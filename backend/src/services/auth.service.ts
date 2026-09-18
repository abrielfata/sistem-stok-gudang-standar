import { db } from '../config/database.js';
import { users } from '../db/schema/users.schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { UnauthorizedError } from '../errors/AppError.js';
import { verifyPassword } from '../helpers/password.helper.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../helpers/jwt.helper.js';
import { z } from 'zod';
import { loginSchema } from '../validators/auth.validator.js';

import { AuditService } from './audit.service.js';

export class AuthService {
  static async login(data: z.infer<typeof loginSchema>) {
    const userList = await db
      .select()
      .from(users)
      .where(and(eq(users.email, data.email), eq(users.isActive, true), isNull(users.deletedAt)))
      .limit(1);

    const user = userList[0];
    if (!user) {
      throw new UnauthorizedError('Email atau password salah');
    }

    const isMatch = await verifyPassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Email atau password salah');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    
    // Log Audit Login
    try {
      await AuditService.log({
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        description: `Pengguna ${user.name} (${user.email}) berhasil login`,
      });
    } catch (e) {
      console.error('Failed to write audit log for login:', e);
    }

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken({ userId: user.id }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async refreshToken(oldRefreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new UnauthorizedError('Refresh token tidak valid atau telah kedaluwarsa');
    }

    const userList = await db
      .select()
      .from(users)
      .where(and(eq(users.id, payload.userId), eq(users.isActive, true), isNull(users.deletedAt)))
      .limit(1);

    const user = userList[0];
    if (!user) {
      throw new UnauthorizedError('User tidak ditemukan atau tidak aktif');
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };

    return {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken({ userId: user.id }),
    };
  }

  static async me(userId: string) {
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!userList[0]) {
      throw new UnauthorizedError('User tidak ditemukan');
    }

    return userList[0];
  }
}
