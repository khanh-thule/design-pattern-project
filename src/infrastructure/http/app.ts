import express, { Express } from 'express';
import { Container } from '../../config/container';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './errorHandler';
import { openApiSpec } from './openapi';
import { requireAuth } from './requireAuth';
import { authRouter } from './routes/auth.routes';
import { brandsRouter } from './routes/brands.routes';
import { cartRouter } from './routes/cart.routes';
import { customersRouter } from './routes/customers.routes';
import { ordersRouter } from './routes/orders.routes';

export const createApp = (container: Container): Express => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use('/auth', authRouter(container.auth));
  app.use('/customers/:customerId', requireAuth(container.auth));

  app.use('/brands', brandsRouter(container.brands));
  app.use('/customers', customersRouter(container.customers, container.orders));
  app.use(cartRouter(container.carts));
  app.use(ordersRouter(container.orderService));

  app.use(errorHandler);

  return app;
};
