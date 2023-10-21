import {type Response} from 'express';
import {getReasonPhrase, StatusCodes} from 'http-status-codes';
import {FieldError, ValidationError} from '../types/response';

export const sendBadRequest = (
  payload: ValidationError | FieldError | string,
  response: Response
): void => {
  response.status(StatusCodes.BAD_REQUEST);
  if (typeof payload === 'string') {
    response.json({
      error: getReasonPhrase(StatusCodes.BAD_REQUEST),
      message: payload,
    });
  } else if (Array.isArray(payload)) {
    response.json({
      error: getReasonPhrase(StatusCodes.BAD_REQUEST),
      messages: payload,
    });
  } else {
    response.json({
      error: getReasonPhrase(StatusCodes.BAD_REQUEST),
      messages: [payload],
    });
  }
};

export const sendCreated = (payload: never, response: Response): void => {
  response.status(StatusCodes.CREATED).json({
    status: getReasonPhrase(StatusCodes.CREATED),
    data: payload,
  });
};

export const sendOkWithPayload = (
  payload: never,
  response: Response,
  meta?: never
): void => {
  response.status(StatusCodes.OK).json({
    status: getReasonPhrase(StatusCodes.OK),
    data: payload,
    meta,
  });
};

export const sendOkWithMessage = (
  message: string,
  response: Response
): void => {
  response.status(StatusCodes.OK).json({
    status: getReasonPhrase(StatusCodes.OK),
    message,
  });
};

export const sendForbidden = (response: Response): void => {
  response.status(StatusCodes.FORBIDDEN).json({
    error: getReasonPhrase(StatusCodes.FORBIDDEN),
  });
};
