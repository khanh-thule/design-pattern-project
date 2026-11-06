import { randomBytes } from 'node:crypto';
import { UnauthorizedError } from '../../domain/shared/DomainError';
import { CustomerRepository } from '../ports/CustomerRepository';
import { PasswordHasher } from '../ports/PasswordHasher';
import { TokenService } from '../ports/TokenService';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  private readonly refreshTokens = new Map<string, { customerId: string; expiresAt: number }>();

  constructor(
    private readonly customers: CustomerRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async login(customerId: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const hash = await this.customers.findPasswordHash(customerId);
    if (!hash || !(await this.hasher.verify(password, hash))) {
      throw new UnauthorizedError('Identifiants invalides');
    }
    const refreshToken = randomBytes(32).toString('hex');
    this.refreshTokens.set(refreshToken, { customerId, expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS });
    return { accessToken: this.tokens.sign(customerId), refreshToken };
  }

  refresh(refreshToken: string): { accessToken: string } {
    const entry = this.refreshTokens.get(refreshToken);
    if (!entry || entry.expiresAt < Date.now()) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedError('Refresh token invalide ou expiré');
    }
    return { accessToken: this.tokens.sign(entry.customerId) };
  }

  logout(refreshToken: string): void {
    this.refreshTokens.delete(refreshToken);
  }

  authenticate(accessToken: string): string {
    return this.tokens.verify(accessToken);
  }
}
