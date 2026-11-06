import { Pizza, PizzaRecipe } from './Pizza';
import { Size } from './Size';
import { SizePricingRule } from './SizePricingRule';

export class MenuPizza implements Pizza {
  private readonly computedPrice: number;

  constructor(
    readonly label: string,
    private readonly basePrice: number,
    readonly size: Size,
    private readonly sizing: SizePricingRule,
  ) {
    this.computedPrice = sizing.apply(basePrice, size);
  }

  price(): number {
    return this.computedPrice;
  }

  withSize(size: Size): MenuPizza {
    return new MenuPizza(this.label, this.basePrice, size, this.sizing);
  }

  recipe(): PizzaRecipe {
    return { pizza: this.label, size: this.size };
  }
}
