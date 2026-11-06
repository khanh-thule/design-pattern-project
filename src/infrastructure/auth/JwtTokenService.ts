import jwt from 'jsonwebtoken';
import { TokenService } from '../../application/ports/TokenService';
import { UnauthorizedError } from '../../domain/shared/DomainError';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn = '30m',
  ) {}

  sign(customerId: string): string {
    return jwt.sign({}, this.secret, { subject: customerId, expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): string {
    try {
      const { sub } = jwt.verify(token, this.secret) as jwt.JwtPayload;
      if (!sub) throw new UnauthorizedError('Token invalide');
      return sub;
    } catch {
      throw new UnauthorizedError('Token invalide ou expiré');
    }
  }
}
