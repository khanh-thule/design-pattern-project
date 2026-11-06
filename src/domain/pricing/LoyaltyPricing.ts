import { round2 } from '../shared/money';
import { PricingStrategy } from './PricingStrategy';

export class LoyaltyPricing implements PricingStrategy {
  private static readonly DISCOUNT_RATE = 0.1;

  apply(subtotal: number): number {
    return round2(subtotal * (1 - LoyaltyPricing.DISCOUNT_RATE));
  }
}
