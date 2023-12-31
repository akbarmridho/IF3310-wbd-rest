import {type NextFunction, type Request, type Response} from 'express';
import {getReasonPhrase, StatusCodes} from 'http-status-codes';

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  console.log(error.stack);

  response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    message:
      process.env.NODE_ENV !== 'production'
        ? error.message
        : getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  });
};
