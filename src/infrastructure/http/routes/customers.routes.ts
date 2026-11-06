import { Router } from 'express';
import { z } from 'zod';
import { CustomerRepository } from '../../../application/ports/CustomerRepository';
import { OrderRepository } from '../../../application/ports/OrderRepository';
import { ORDER_STATUSES } from '../../../domain/order/OrderStatus';
import { orderToJson } from './orders.routes';

const HistoryQuery = z.object({ status: z.enum(ORDER_STATUSES).optional() });

export const customersRouter = (customers: CustomerRepository, orders: OrderRepository): Router => {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await customers.findAll());
  });

  router.get('/:customerId/orders', async (req, res) => {
    const query = HistoryQuery.safeParse(req.query);
    if (!query.success) {
      res.status(400).json({ error: 'INVALID_STATUS', message: `status doit valoir : ${ORDER_STATUSES.join(', ')}` });
      return;
    }

    const history = await orders.findByCustomer(req.params.customerId, query.data.status);
    res.json(history.map(orderToJson));
  });

  return router;
};
