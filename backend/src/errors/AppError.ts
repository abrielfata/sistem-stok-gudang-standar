export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR',
    public details: unknown = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Data tidak ditemukan', details: unknown = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Autentikasi gagal atau token tidak valid', details: unknown = null) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Anda tidak memiliki hak akses untuk tindakan ini', details: unknown = null) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Permintaan tidak valid', details: unknown = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Data sudah ada atau terjadi konflik', details: unknown = null) {
    super(message, 409, 'CONFLICT', details);
  }
}
