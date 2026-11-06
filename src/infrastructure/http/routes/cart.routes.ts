import { Router } from 'express';
import { z } from 'zod';
import { CartService, CartSession } from '../../../application/use-cases/CartService';
import { Ingredient, INGREDIENTS } from '../../../domain/pizza/custom/Ingredient';
import { SIZES } from '../../../domain/pizza/Size';
import { subtotal } from '../../../domain/pizza/subtotal';

const SizeSchema = z.enum(SIZES);
const AddPizzaBody = z.union([
  z.object({ brandId: z.string(), pizza: z.string(), size: SizeSchema }),
  z.object({
    brandId: z.string(),
    base: z.enum(['tomato', 'cream']),
    size: SizeSchema,
    ingredients: z.array(z.enum(Object.keys(INGREDIENTS) as [Ingredient, ...Ingredient[]])),
  }),
]);
const ChangeSizeBody = z.object({ size: SizeSchema });
const Index = z.coerce.number().int().nonnegative();

export const cartToJson = (session?: CartSession) => {
  const pizzas = session?.cart.getPizzas() ?? [];
  return {
    brandId: session?.brand.id ?? null,
    pizzas: pizzas.map((pizza, index) => ({ index, label: pizza.label, size: pizza.size, price: pizza.price() })),
    subtotal: subtotal(pizzas),
  };
};

export const cartRouter = (carts: CartService): Router => {
  const router = Router();

  router.get('/customers/:customerId/cart', (req, res) => {
    res.json(cartToJson(carts.get(req.params.customerId)));
  });

  router.post('/customers/:customerId/cart/pizzas', (req, res) => {
    res.status(201).json(cartToJson(carts.add(req.params.customerId, AddPizzaBody.parse(req.body))));
  });

  router.patch('/customers/:customerId/cart/pizzas/:index', (req, res) => {
    const { size } = ChangeSizeBody.parse(req.body);
    res.json(cartToJson(carts.changeSize(req.params.customerId, Index.parse(req.params.index), size)));
  });

  router.delete('/customers/:customerId/cart/pizzas/:index', (req, res) => {
    res.json(cartToJson(carts.remove(req.params.customerId, Index.parse(req.params.index))));
  });

  router.post('/customers/:customerId/cart/undo', (req, res) => {
    res.json(cartToJson(carts.undo(req.params.customerId)));
  });

  router.post('/customers/:customerId/cart/redo', (req, res) => {
    res.json(cartToJson(carts.redo(req.params.customerId)));
  });

  return router;
};
