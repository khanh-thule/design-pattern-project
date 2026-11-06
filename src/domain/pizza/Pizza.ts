import { Ingredient, PizzaBase } from './custom/Ingredient';
import { Size } from './Size';

export type PizzaRecipe =
  | { pizza: string; size: Size }
  | { base: PizzaBase; size: Size; ingredients: Ingredient[] };

export interface Pizza {
  readonly label: string;
  readonly size: Size;
  price(): number;
  withSize(size: Size): Pizza;
  recipe(): PizzaRecipe;
}
