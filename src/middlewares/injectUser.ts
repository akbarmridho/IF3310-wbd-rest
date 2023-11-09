import {type NextFunction, Request, type Response} from 'express';
import {UnauthorizedError} from 'express-jwt';
import {userService} from '../services/UserService';

export const injectUser = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  if (!request.skipAuthMiddleware) {
    const auth = request.auth;

    if (!auth) {
      throw new Error('Missing auth in jwt.');
    }

    const user = await userService.getCachedUser(auth.id);

    if (!user) {
      throw new UnauthorizedError(
        'revoked_token',
        new Error('UserNotFoundError')
      );
    }

    request.user = {
      ...user,
    };
  }

  next();
};
