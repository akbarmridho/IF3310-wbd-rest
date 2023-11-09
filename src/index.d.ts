import {JwtPayload} from 'jsonwebtoken';

// i don't know but don't delete this line
export {};

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
