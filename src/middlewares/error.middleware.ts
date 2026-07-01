import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { ApiErrorResponse } from '../http/responses.js';

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    const response: ApiErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    };

    return res.status(error.statusCode).json(response);
  }

  console.error('Unhandled error', error);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error.',
    },
  });
};
