import {
  sendBadRequest,
  sendCreated,
  sendOkWithMessage,
} from '../utils/sendResponse';
import {Request, Response} from 'express';
import {db} from '../database/db';
import {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from '../types/auth';
import {eq} from 'drizzle-orm';
import {users} from '../database/schema';
import {Encryption} from '../utils/encryption';
import {signJwtToken} from '../utils/jwt';
import {JWT_EXPIRE_TIME} from '../config/jwt';
import {getReasonPhrase, StatusCodes} from 'http-status-codes';

// register
export async function registerHandler(
  request: Request,
  response: Response
): Promise<void> {
  const data = RegisterRequest.parse(request.body);

  // existing users check
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, data.username),
  });

  if (existingUser) {
    sendBadRequest('User with given username already exists', response);
    return;
  }

  // insert new user to db
  const {password, ...payload} = (
    await db
      .insert(users)
      .values({
        username: data.username,
        name: data.name,
        password: await Encryption.encrypt(data.password),
      })
      .returning()
  )[0];

  sendCreated(payload, response);
}

export async function loginHandler(
  request: Request,
  response: Response
): Promise<void> {
  const data = LoginRequest.parse(request.body);

  // get user
  const user = await db.query.users.findFirst({
    where: eq(users.username, data.username),
  });

  // user not exist in db
  if (!user) {
    sendBadRequest('Invalid login credentials', response);
    return;
  }

  // check password
  if (!(await Encryption.compare(data.password, user.password))) {
    sendBadRequest('Invalid login credentials', response);
    return;
  }

  // jwt
  const access_token = signJwtToken(user.id, JWT_EXPIRE_TIME);
  response
    .status(StatusCodes.OK)
    .cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      maxAge: JWT_EXPIRE_TIME * 1000,
      sameSite: 'none',
    })
    .json({
      status: getReasonPhrase(StatusCodes.OK),
      message: 'Login success',
    });
}

export async function logoutHandler(
  request: Request,
  response: Response
): Promise<void> {
  response.status(StatusCodes.OK).clearCookie('access_token').json({
    message: 'Logout success',
  });
}

export async function changePasswordHandler(
  request: Request,
  response: Response
): Promise<void> {
  const data = ChangePasswordRequest.parse(request.body);

  // get user from db
  const user = await db.query.users.findFirst({
    where: eq(users.id, request.user!.id),
  });

  // user not exist in db
  if (!user) {
    sendBadRequest('User does not exist', response);
    return;
  }

  // oldPassword not equal
  if (!(await Encryption.compare(data.oldPassword, user!.password))) {
    sendBadRequest('Invalid old password', response);
    return;
  }

  // update password
  await db
    .update(users)
    .set({password: await Encryption.encrypt(data.newPassword)})
    .where(eq(users.id, user.id));

  sendOkWithMessage('Change password success', response);
}
