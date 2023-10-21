import {type NextFunction, type Response} from 'express';
import {type AuthenticatedRequest} from '../types/auth';
// import {UnauthorizedError} from 'express-jwt';

export const injectUser = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
): Promise<void> => {
  // todo create inject user middleware
  // const user = await client.user.findUnique({
  //   where: {
  //     id: request.auth?.id,
  //   },
  // });

  // if (user === null) {
  //   throw new UnauthorizedError(
  //     'revoked_token',
  //     new Error('UserNotFoundError')
  //   );
  // }

  // request.user = {
  //   ...user,
  //   assignedPools: user.assignedPools.map(each => each.pool.id),
  // };

  next();
};
