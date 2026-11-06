import { describe, expect, it } from 'vitest';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';
import { HappyHourPricing } from '../src/domain/pricing/HappyHourPricing';
import { LoyaltyPricing } from '../src/domain/pricing/LoyaltyPricing';
import { PromoCodePricing } from '../src/domain/pricing/PromoCodePricing';
import { StandardPricing } from '../src/domain/pricing/StandardPricing';

describe('US 2 - Calcul du prix', () => {
  const brand = new DaMichele();
  const subtotal = brand.orderPizza('Margherita', 'L').price() + brand.orderPizza('Marinara', 'XL').price();

  it('Standard : prix normal', () => {
    expect(new StandardPricing().apply(subtotal)).toBe(25);
  });

  it('Happy Hour : -20 %', () => {
    expect(new HappyHourPricing().apply(subtotal)).toBe(20);
  });

  it('Code promo : réduction appliquée', () => {
    expect(new PromoCodePricing(5).apply(subtotal)).toBe(20);
  });

  it('Fidélité : -10 %', () => {
    expect(new LoyaltyPricing().apply(subtotal)).toBe(22.5);
  });
});
