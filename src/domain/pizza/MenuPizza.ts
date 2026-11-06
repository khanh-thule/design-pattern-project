import { Size } from './Size';
import { SizePricingRule } from './SizePricingRule';

export class MenuPizza {
  constructor(
    readonly label: string,
    private readonly basePrice: number,
    readonly size: Size,
    private readonly sizing: SizePricingRule,
  ) {
    sizing.apply(basePrice, size);
  }

  price(): number {
    return this.sizing.apply(this.basePrice, this.size);
  }

  withSize(size: Size): MenuPizza {
    return new MenuPizza(this.label, this.basePrice, size, this.sizing);
  }
}
