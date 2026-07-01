export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static validation(message: string, details?: unknown) {
    return new AppError('VALIDATION_ERROR', message, 400, details);
  }

  static unauthorized(message = 'Unauthorized.') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Forbidden.') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(message: string) {
    return new AppError('NOT_FOUND', message, 404);
  }

  static conflict(message: string) {
    return new AppError('CONFLICT', message, 409);
  }

  static internal(message = 'Internal server error.') {
    return new AppError('INTERNAL_ERROR', message, 500);
  }
}
