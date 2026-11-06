export type PizzaBase = 'tomato' | 'cream';

export const INGREDIENTS = {
  mozzarella: 1.5,
  pepperoni: 2,
  champignons: 1,
  jambon: 2,
  olives: 1,
  gorgonzola: 2.5,
} as const;

export type Ingredient = keyof typeof INGREDIENTS;
