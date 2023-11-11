import {
  sendBadRequest,
  sendCreated,
  sendOkWithMessage,
  sendOkWithPayload,
  sendServerError,
} from '../utils/sendResponse';
import {Request, Response} from 'express';
import {db} from '../database/db';
import {ChangePasswordRequest, LoginRequest, PasswordType, UsernameType} from '../types/auth';
import {eq} from 'drizzle-orm';
import {users} from '../database/schema';
import {z} from 'zod';
import {Encryption} from '../utils/encryption';
import {signJwtToken} from '../utils/jwt';
import {JWT_EXPIRE_TIME} from '../config/jwt';
import {StatusCodes, getReasonPhrase} from 'http-status-codes';

// register
export async function registerHandler(
  request: Request,
  response: Response
): Promise<void> {
  const username = request.body.username;
  const name = request.body.name;
  const password = request.body.password;

  if (!username || !name || !password) {
    sendBadRequest('Incomplete registration credentials', response);
    return;
  }

  try {
    const validUsername = UsernameType.parse(username);
    const validName = UsernameType.parse(name);
    const validPassword = PasswordType.parse(password);

    // existing users check
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, validUsername),
    });

    if (existingUser) {
      sendBadRequest('User with given username already exists', response);
      return;
    }

    // insert new user to db
    const result = await db
      .insert(users)
      .values({
        username: validUsername,
        name: validName,
        password: await Encryption.encrypt(validPassword),
      })
      .returning();

    
    sendCreated({
      id: result[0].id,
      username: result[0].username,
    }, response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Invalid registration credentials: ', error);
      sendBadRequest('Invalid registration parameters', response);
    } else {
      console.log('Error registering user: ', error);
      sendServerError('Error registering user', response);
    }
  }
}

export async function loginHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const data = LoginRequest.parse(request.body);
      
    // get user
    const user = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    });
  
    // user not exist in db
    if (user === null) {
      sendBadRequest('User does not exist', response);
      return;
    }
  
    // check password
    if (!(await Encryption.compare(data.password, user!.password))) {
      sendBadRequest('Invalid login credentials', response);
      return;
    }
  
    // jwt
    const access_token = signJwtToken(user!.id, JWT_EXPIRE_TIME);
    response.status(StatusCodes.OK).cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      maxAge: JWT_EXPIRE_TIME * 1000,
      sameSite: 'none'
    }).json({
      status: getReasonPhrase(StatusCodes.OK),
      message: "Login success",
      token: access_token
    })
  
  } catch (error) {
    console.log('Invalid or incomplete credentials: ', error);
    sendBadRequest('Invalid or incomplete credentials', response);
  }
}

export async function logoutHandler(
  request: Request,
  response: Response
): Promise<void> {
  try {
    response.status(StatusCodes.OK).clearCookie('access_token').json({
      message: 'Logout success'
    })
  } catch (error) {
      console.log('Error on logout: ', error);
      sendServerError('Error on logout', response);    
  }
}

export async function changePasswordHandler(
  request: Request,
  response: Response
  ): Promise<void> {
  try {
    const data = ChangePasswordRequest.parse(request.body);
    const uid = request.user?.id;
    const oldPassword = data.oldPassword;
    const newPassword = data.newPassword;

    if (!uid || !oldPassword || !newPassword) {
      sendBadRequest('Incomplete credentials', response);
      return;
    }

    // get user from db
    const user = await db.query.users.findFirst({
      where: eq(users.id, uid),
    });

    // user not exist in db
    if (user === null) {
      sendBadRequest('User does not exist', response);
      return;
    }

    // oldPassword not equal
    if (!(await Encryption.compare(oldPassword, user!.password))) {
      sendBadRequest('Invalid old password', response);
      return;
    }

    // update password
    const result = await db.update(users)
    .set({ password: await Encryption.encrypt(newPassword) })
    .where(eq(users.id, uid)).returning({updatedId: users.id, updatedUsername: users.username});

    sendOkWithPayload(result[0], response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Invalid passwords: ', error);
      sendBadRequest('Invalid passwords', response);
    } else {
      console.log('Error updating user password: ', error);
      sendServerError('Error updating user password', response);
    }
  }

}