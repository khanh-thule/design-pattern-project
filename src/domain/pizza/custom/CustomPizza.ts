import { Pizza, PizzaRecipe } from '../Pizza';
import { Size } from '../Size';
import { SizePricingRule } from '../SizePricingRule';
import { Ingredient, PizzaBase } from './Ingredient';
import { Dough, IngredientDecorator, PizzaComponent } from './PizzaComponent';

export class CustomPizza implements Pizza {
  readonly label = 'Pizza personnalisée';
  private readonly computedPrice: number;

  constructor(
    private readonly base: PizzaBase,
    private readonly ingredients: readonly Ingredient[],
    readonly size: Size,
    private readonly sizing: SizePricingRule,
  ) {
    const component = ingredients.reduce<PizzaComponent>(
      (pizza, ingredient) => new IngredientDecorator(pizza, ingredient),
      new Dough(base),
    );
    this.computedPrice = sizing.apply(component.cost(), size);
  }

  price(): number {
    return this.computedPrice;
  }

  withSize(size: Size): Pizza {
    return new CustomPizza(this.base, this.ingredients, size, this.sizing);
  }

  recipe(): PizzaRecipe {
    return { base: this.base, size: this.size, ingredients: [...this.ingredients] };
  }
}
