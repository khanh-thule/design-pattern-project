import express, { Express } from 'express';
import { Container } from '../../config/container';
import { errorHandler } from './errorHandler';
import { brandsRouter } from './routes/brands.routes';

export const createApp = (container: Container): Express => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/brands', brandsRouter(container.brands));

  app.use(errorHandler);

  return app;
};
