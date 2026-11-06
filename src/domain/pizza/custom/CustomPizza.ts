import { Pizza } from '../Pizza';
import { Size } from '../Size';
import { SizePricingRule } from '../SizePricingRule';
import { PizzaComponent } from './PizzaComponent';

export class CustomPizza implements Pizza {
  readonly label = 'Pizza personnalisée';

  constructor(
    private readonly component: PizzaComponent,
    readonly size: Size,
    private readonly sizing: SizePricingRule,
  ) {
    sizing.apply(component.cost(), size);
  }

  price(): number {
    return this.sizing.apply(this.component.cost(), this.size);
  }

  withSize(size: Size): Pizza {
    return new CustomPizza(this.component, size, this.sizing);
  }
}
