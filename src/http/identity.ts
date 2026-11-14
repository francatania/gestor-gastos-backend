import { Request } from 'express';
import { AppError } from '../errors/app-error.js';

export function validateId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    throw AppError.validation('Id is invalid.');
  }
}

export const authenticatedUserId = (req: Request): string => {
  if (!req.user) throw AppError.unauthorized();
  return req.user._id;
};

export const assertSameUser = (requested: unknown, userId: string) => {
  validateId(userId);
  if (requested === undefined) return;
  validateId(requested);
  if (requested.toLowerCase() !== userId.toLowerCase()) {
    throw AppError.notFound('Resource not found.');
  }
};

export const refId = (ref: unknown): string =>
  ref && typeof ref === 'object' && '_id' in ref ? String(ref._id) : String(ref);
