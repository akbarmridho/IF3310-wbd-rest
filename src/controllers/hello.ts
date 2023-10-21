import {sendOkWithMessage} from '../utils/sendResponse';
import {Request, Response} from 'express';

export const sayHello = async (
  request: Request,
  response: Response
): Promise<void> => {
  sendOkWithMessage('Hello world!', response);
};
