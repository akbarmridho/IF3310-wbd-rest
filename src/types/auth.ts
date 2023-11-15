import {z} from 'zod';

export const UsernameType = z
  .string()
  .toLowerCase()
  .trim()
  .min(5)
  .max(20)
  .regex(
    /^(?=[a-zA-Z0-9._]{2,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
    'Username only could have letter, number, symbol _ and .'
  );
export const PasswordType = z.string().min(8).max(127);

export const LoginRequest = z.object({
  username: z.string().toLowerCase().trim(),
  password: z.string(),
});

export const ChangePasswordRequest = z.object({
  oldPassword: z.string(),
  newPassword: PasswordType,
});

export const RegisterRequest = z.object({
  username: UsernameType,
  name: z.string().min(2).max(127),
  password: PasswordType,
});
