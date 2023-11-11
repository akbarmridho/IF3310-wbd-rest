import {
  sendBadRequest,
  sendCreated,
  sendOkWithMessage,
  sendOkWithPayload,
  sendServerError,
} from '../utils/sendResponse';
import {Request, Response} from 'express';
import {db} from '../database/db';
import {PasswordType, UsernameType} from '../types/auth';
import {eq} from 'drizzle-orm';
import {users} from '../database/schema';
import {z} from 'zod';
import {Encryption} from '../utils/encryption';

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
  const username = request.body.username;
  const password = request.body.password;

  if (!username || !password) {
    sendBadRequest('Incomplete login credentials', response);
    return;
  }

  // get user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (user === null) {
    sendBadRequest('User does not exist', response);
    return;
  }

  if (!(await Encryption.compare(password, user!.password))) {
    sendBadRequest('Invalid login credentials', response);
    return;
  }

  // TODO: jwt

  sendOkWithMessage('Login success', response);
}

export async function logoutHandler(
  request: Request,
  response: Response
): Promise<void> {
  // TODO: logout
  sendOkWithMessage('Logout success', response);
}

export async function changePasswordHandler(
  request: Request,
  response: Response
): Promise<void> {
  const username = request.body.username;
  const oldPassword = request.body.oldPassword;
  const newPassword = request.body.newPassword;

  if (!username || !oldPassword || !newPassword) {
    sendBadRequest('Incomplete credentials', response);
    return;
  }

  // get user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (user === null) {
    sendBadRequest('User does not exist', response);
    return;
  }

  if (!(await Encryption.compare(oldPassword, user!.password))) {
    sendBadRequest('Invalid login credentials', response);
    return;
  }

  try {
    const validNewPassword = PasswordType.parse(newPassword);

    const result = await db.update(users)
    .set({ password: await Encryption.encrypt(validNewPassword) })
    .where(eq(users.username, username)).returning({updatedId: users.id, updatedUsername: users.username});

    sendOkWithPayload(result[0], response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Invalid new password: ', error);
      sendBadRequest('Invalid new password', response);
    } else {
      console.log('Error updating user password: ', error);
      sendServerError('Error updating user password', response);
    }
  }

}

// TODO: jwt