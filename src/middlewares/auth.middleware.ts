import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { AppError } from '../errors/app-error.js';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('jwt', { session: false }, (error: unknown, user: unknown) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return next(AppError.unauthorized());
    }

    req.user = user;
    return next();
  })(req, res, next);
};
