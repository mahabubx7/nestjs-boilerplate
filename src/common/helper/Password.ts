import * as bcrypt from 'bcrypt';
class PasswordHelper {
  async hashedPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}

export const passwordHelper = new PasswordHelper();
