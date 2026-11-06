import { Router } from 'express';
import { z } from 'zod';
import { OrderService } from '../../../application/use-cases/OrderService';
import { Order } from '../../../domain/order/Order';
import { cartToJson } from './cart.routes';

const PlaceOrderBody = z.object({
  zipCode: z.string(),
  pricing: z.string(),
  promoCode: z.string().optional(),
  paymentMethod: z.string(),
});

export const orderToJson = (order: Order) => ({
  id: order.id,
  status: order.getStatus(),
  createdAt: order.createdAt,
  brandId: order.brandId,
  total: order.total,
});

export const ordersRouter = (orders: OrderService): Router => {
  const router = Router();

  router.post('/customers/:customerId/orders', async (req, res) => {
    const order = await orders.place(req.params.customerId, PlaceOrderBody.parse(req.body));
    res.status(201).json(orderToJson(order));
  });

  router.get('/customers/:customerId/orders/:orderId', async (req, res) => {
    const order = await orders.find(req.params.customerId, req.params.orderId);
    res.json({ ...orderToJson(order), lines: order.lines });
  });

  router.post('/customers/:customerId/orders/:orderId/reorder', async (req, res) => {
    res.json(cartToJson(await orders.reorder(req.params.customerId, req.params.orderId)));
  });

  router.post('/orders/:orderId/deliver', async (req, res) => {
    res.json(orderToJson(await orders.deliver(req.params.orderId)));
  });

  router.post('/orders/:orderId/cancel', async (req, res) => {
    res.json(orderToJson(await orders.cancel(req.params.orderId)));
  });

  return router;
};
