import {type NextFunction, type Request, type Response} from 'express';
import {expressjwt} from 'express-jwt';
import {getSecret, JWT_ALGORITHM} from '../config/jwt';

export const requireAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (request.skipAuthMiddleware) {
    next();
  } else {
    expressjwt({
      secret: getSecret(),
      algorithms: [JWT_ALGORITHM],
      getToken: (req): string | undefined => {
        if (req.cookies.access_token !== undefined) {
          return req.cookies.access_token;
        } else if (
          req.headers.authorization !== undefined &&
          req.headers.authorization.split(' ')[0] === 'Bearer'
        ) {
          return req.headers.authorization.split(' ')[1];
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        }
        return undefined;
      },
    })(request, response, next).catch(next);
  }
};
