import { round2 } from '../shared/money';
import { PricingStrategy } from './PricingStrategy';

export class PromoCodePricing implements PricingStrategy {
  constructor(private readonly discount: number) {}

  apply(subtotal: number): number {
    return round2(Math.max(0, subtotal - this.discount));
  }
}
