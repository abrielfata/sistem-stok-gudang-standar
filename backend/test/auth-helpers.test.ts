import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../src/helpers/password.helper.js';
import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from '../src/helpers/jwt.helper.js';

describe('Auth Helpers', () => {
  it('should correctly hash and verify password', async () => {
    const plain = 'password123';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    const isMatch = await verifyPassword(plain, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword('wrongpassword', hash);
    expect(isWrong).toBe(false);
  });

  it('should generate and verify valid access tokens', () => {
    process.env.JWT_SECRET = 'sample_secret_key_12345';
    process.env.JWT_REFRESH_SECRET = 'sample_refresh_secret_key_12345';

    const payload = { userId: '123-abc', email: 'admin@gudang.com', role: 'ADMIN' as const };
    const token = generateAccessToken(payload);
    
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('should generate and verify valid refresh tokens', () => {
    process.env.JWT_REFRESH_SECRET = 'sample_refresh_secret_key_12345';

    const payload = { userId: '123-abc' };
    const token = generateRefreshToken(payload);
    
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });
});
