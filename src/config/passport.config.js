// import dotenv from 'dotenv';
// dotenv.config();

import passport from 'passport';
import config from '../config/config.js';
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET,
  };
  
  export const init = ()=>{
    passport.use('jwt', new JWTStrategy(opts, (payload, done)=>{
      return done(null, payload);
    }))
  }

