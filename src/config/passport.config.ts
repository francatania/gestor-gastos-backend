import passport from 'passport';
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  VerifyCallback,
} from 'passport-jwt';
import config from '../config/config.js';
import { validateId } from '../http/identity.js';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
};

export const init = () => {
  passport.use(
    'jwt',
    new JWTStrategy(opts, (payload: unknown, done: VerifyCallback) => {
      try {
        if (!payload || typeof payload !== 'object' || !('_id' in payload)) return done(null, false);
        validateId(payload._id);
        return done(null, { _id: payload._id.toLowerCase() });
      } catch {
        return done(null, false);
      }
    }) as unknown as passport.Strategy
  );
};
