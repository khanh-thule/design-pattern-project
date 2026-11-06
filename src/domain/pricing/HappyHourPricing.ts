import { round2 } from '../shared/money';
import { PricingStrategy } from './PricingStrategy';

export class HappyHourPricing implements PricingStrategy {
  private static readonly DISCOUNT_RATE = 0.2;

  apply(subtotal: number): number {
    return round2(subtotal * (1 - HappyHourPricing.DISCOUNT_RATE));
  }
}
