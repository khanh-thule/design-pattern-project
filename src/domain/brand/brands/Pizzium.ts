import { SingleSizePricing, SizePricingRule } from '../../pizza/SizePricingRule';
import { MenuEntry, Pizzeria } from '../Pizzeria';

export class Pizzium extends Pizzeria {
  readonly id = 'pizzium';
  readonly name = 'Pizzium';

  protected createMenu(): MenuEntry[] {
    return [
      { name: 'Napolitaine', basePrice: 10 },
      { name: 'Quattro Formaggi', basePrice: 12 },
    ];
  }

  protected createSizePricingRule(): SizePricingRule {
    return new SingleSizePricing('M');
  }
}
