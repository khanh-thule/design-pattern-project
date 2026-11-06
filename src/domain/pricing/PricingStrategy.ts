export interface PricingStrategy {
  apply(subtotal: number): number;
}
