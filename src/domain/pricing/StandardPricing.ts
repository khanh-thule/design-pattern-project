import { round2 } from '../shared/money';
import { PricingStrategy } from './PricingStrategy';

export class StandardPricing implements PricingStrategy {
  apply(subtotal: number): number {
    return round2(subtotal);
  }
}
