declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export type VerifyCallback = (error: unknown, user?: unknown, info?: unknown) => void;

  export class Strategy extends PassportStrategy {
    constructor(
      options: {
        jwtFromRequest: (request: unknown) => string | null;
        secretOrKey: string | undefined;
      },
      verify: (payload: unknown, done: VerifyCallback) => void
    );
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (request: unknown) => string | null;
  };
}
