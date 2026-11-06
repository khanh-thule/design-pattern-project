import { RequestHandler } from 'express';
import { AuthService } from '../../application/use-cases/AuthService';
import { ForbiddenError, UnauthorizedError } from '../../domain/shared/DomainError';


export const requireAuth =
  (auth: AuthService): RequestHandler<{ customerId: string }> =>
  (req, _res, next) => {
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedError();

    if (auth.authenticate(token) !== req.params.customerId) throw new ForbiddenError();
    next();
  };
