import {type NextFunction, type Request, type Response} from 'express';
import {API_KEY} from '../config/api';
import {sendForbidden} from '../utils/sendResponse';
import {subscriptionService} from '../services/SubscriptionService';

export const allowApiKey = async (
  request: Request<{}, {}, {}, {token?: string}>,
  response: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    request.headers.authorization !== undefined &&
    request.headers.authorization.split(' ')[0] === 'Basic'
  ) {
    token = request.headers.authorization.split(' ')[1];
  } else if (request.query.token) {
    token = request.query.token;
  }

  if (token) {
    const values = Buffer.from(token, 'base64').toString().split(':');

    if (values.length !== 2) {
      sendForbidden(response);
      return;
    }

    const userId = parseInt(values[0]);
    const apiKey = values[1];

    const subscriber = await subscriptionService.getSubscriber(userId);

    // skema panggil soap
    if (
      apiKey === API_KEY &&
      subscriber !== null &&
      Date.now() < Date.parse(subscriber.subscriptionEndTime)
    ) {
      request.apiUserId = userId;
      request.skipAuthMiddleware = true;
    }
  }

  next();
};
