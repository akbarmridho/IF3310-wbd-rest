import * as bcrypt from 'bcryptjs';

export class Encryption {
  static async encrypt(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  static async compare(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
