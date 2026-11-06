import { INGREDIENTS, Ingredient, PizzaBase } from './Ingredient';

export interface PizzaComponent {
  cost(): number;
}

export class Dough implements PizzaComponent {
  private static readonly PRICE = 5;

  constructor(readonly base: PizzaBase) {}

  cost(): number {
    return Dough.PRICE;
  }
}

export class IngredientDecorator implements PizzaComponent {
  constructor(
    private readonly inner: PizzaComponent,
    private readonly ingredient: Ingredient,
  ) {}

  cost(): number {
    return this.inner.cost() + INGREDIENTS[this.ingredient];
  }
}
