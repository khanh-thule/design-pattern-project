import { MultiplicativeSizePricing, SizePricingRule } from '../../pizza/SizePricingRule';
import { MenuEntry, Pizzeria } from '../Pizzeria';

export class Rossopomodoro extends Pizzeria {
  readonly id = 'rossopomodoro';
  readonly name = 'Rossopomodoro';

  protected createMenu(): MenuEntry[] {
    return [
      { name: 'Supreme', basePrice: 12 },
      { name: 'Diavola', basePrice: 11 },
    ];
  }

  protected createSizePricingRule(): SizePricingRule {
    return new MultiplicativeSizePricing({ S: 0.8, M: 1, L: 1.3, XL: 1.5 });
  }
}
