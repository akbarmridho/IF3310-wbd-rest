import {type NextFunction, type Request, type Response} from 'express';
import {API_KEY} from '../config/api';

export const allowApiKey = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (
    request.headers.authorization !== undefined &&
    request.headers.authorization.split(' ')[0] === 'Basic'
  ) {
    // todo:
    // also check for consumer authorization (monolith)
    // todo (middleware auth tapi buat consumer di monolith)
    // gunakan memory cache di sini (cek user yg udh valid di cache kalo gaada baru
    // cek ke service soap)
    // call soap and check for token validity
    const apiKey = request.headers.authorization.split(' ')[1];

    // skema panggil soap
    if (apiKey === API_KEY) {
      request.skipAuthMiddleware = true;
    }
  }

  next();
};
