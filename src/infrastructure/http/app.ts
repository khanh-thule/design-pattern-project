import express, { Express } from 'express';
import { Container } from '../../config/container';
import { errorHandler } from './errorHandler';
import { brandsRouter } from './routes/brands.routes';
import { customersRouter } from './routes/customers.routes';

export const createApp = (container: Container): Express => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/brands', brandsRouter(container.brands));
  app.use('/customers', customersRouter(container.customers, container.orders));

  app.use(errorHandler);

  return app;
};
