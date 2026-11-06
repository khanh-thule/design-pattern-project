export interface PricingStrategy {
  apply(subtotal: number): number;
}

export type PricingFactory = (promoCode?: string) => PricingStrategy;
