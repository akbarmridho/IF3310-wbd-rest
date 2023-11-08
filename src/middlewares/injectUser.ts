import {type NextFunction, Request, type Response} from 'express';
import {db} from '../database/db';
import {eq} from 'drizzle-orm';
import {users} from '../database/schema';
import {UnauthorizedError} from 'express-jwt';

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

    // todo cache this
    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.id),
      columns: {
        id: true,
        username: true,
        name: true,
      },
    });

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
