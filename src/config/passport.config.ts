import passport from 'passport';
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  VerifyCallback,
} from 'passport-jwt';
import config from '../config/config.js';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
};

export const init = () => {
  passport.use(
    'jwt',
    new JWTStrategy(opts, (payload: unknown, done: VerifyCallback) => {
      return done(null, payload);
    }) as unknown as passport.Strategy
  );
};
