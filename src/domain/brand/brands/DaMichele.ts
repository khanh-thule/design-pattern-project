import { AdditiveSizePricing, SizePricingRule } from '../../pizza/SizePricingRule';
import { MenuEntry, Pizzeria } from '../Pizzeria';

export class DaMichele extends Pizzeria {
  readonly id = 'da-michele';
  readonly name = 'Da Michele';

  protected createMenu(): MenuEntry[] {
    return [
      { name: 'Margherita', basePrice: 9 },
      { name: 'Marinara', basePrice: 8 },
    ];
  }

  protected createSizePricingRule(): SizePricingRule {
    return new AdditiveSizePricing({ S: -2, M: 0, L: 3, XL: 5 });
  }
}
