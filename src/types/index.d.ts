import {JwtPayload} from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      skipAuthMiddleware?: boolean;
      user?: {
        id: number;
        username: string;
        name: string;
      };
      auth?: {
        id: number;
      } & JwtPayload;
      apiUserId?: number;
    }
  }
}
