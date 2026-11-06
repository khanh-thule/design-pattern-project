import { Router } from 'express';
import { z } from 'zod';
import { OrderService, PRICINGS } from '../../../application/use-cases/OrderService';
import { Order } from '../../../domain/order/Order';

const PlaceOrderBody = z.object({
  zipCode: z.string(),
  pricing: z.enum(PRICINGS),
  promoCode: z.string().optional(),
  paymentMethod: z.string(),
});

const toJson = (order: Order) => ({ id: order.id, status: order.getStatus(), createdAt: order.createdAt });

export const ordersRouter = (orders: OrderService): Router => {
  const router = Router();

  router.post('/customers/:customerId/orders', async (req, res) => {
    const { order, total } = await orders.place(req.params.customerId, PlaceOrderBody.parse(req.body));
    res.status(201).json({ ...toJson(order), total });
  });

  router.post('/orders/:orderId/deliver', async (req, res) => {
    res.json(toJson(await orders.deliver(req.params.orderId)));
  });

  router.post('/orders/:orderId/cancel', async (req, res) => {
    res.json(toJson(await orders.cancel(req.params.orderId)));
  });

  return router;
};
