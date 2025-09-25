import type { AuthenticatedActor } from '../modules/auth/auth-actor.types';

declare global {
  namespace Express {
    interface Request {
      actor?: AuthenticatedActor;
    }
  }
}
