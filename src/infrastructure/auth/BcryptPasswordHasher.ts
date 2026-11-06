import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../application/ports/PasswordHasher';

export class BcryptPasswordHasher implements PasswordHasher {
  verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
