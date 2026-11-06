import { round2 } from '../shared/money';
import { Pizza } from './Pizza';

export const subtotal = (pizzas: readonly Pizza[]): number =>
  round2(pizzas.reduce((sum, pizza) => sum + pizza.price(), 0));
