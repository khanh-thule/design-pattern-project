import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { PaymentError } from '../../application/ports/PaymentGateway';
import { DomainError, ForbiddenError, NotFoundError, UnauthorizedError } from '../../domain/shared/DomainError';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'INVALID_REQUEST', issues: err.issues });
    return;
  }
  if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof ForbiddenError) {
    res.status(403).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof PaymentError) {
    res.status(502).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof DomainError) {
    res.status(422).json({ error: err.code, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
};
