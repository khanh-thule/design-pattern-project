import { NextFunction, Request, Response } from 'express';
import { DomainError, NotFoundError } from '../../domain/shared/DomainError';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof DomainError) {
    res.status(422).json({ error: err.code, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
};
