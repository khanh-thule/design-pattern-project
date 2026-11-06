import { describe, expect, it } from 'vitest';
import { CustomerRepository } from '../src/application/ports/CustomerRepository';
import { CartService } from '../src/application/use-cases/CartService';
import { OrderService } from '../src/application/use-cases/OrderService';
import { NonEmptyCartValidator } from '../src/application/validation/NonEmptyCartValidator';
import { buildContainer } from '../src/config/container';
import { BrandRegistry } from '../src/domain/brand/BrandRegistry';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';
import { InMemoryOrderRepository } from '../src/infrastructure/persistence/memory/InMemoryOrderRepository';
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

describe('US 2 - Registre des réductions', () => {
  const { pricings } = buildContainer({ PORT: 3000, JWT_SECRET: 'x'.repeat(32) });

  it.each([
    ['standard', undefined, 25],
    ['happy-hour', undefined, 20],
    ['loyalty', undefined, 22.5],
    ['promo', 'PIZZA5', 20],
  ])('choisit la stratégie %s par son nom', (name, promoCode, expected) => {
    expect(pricings[name](promoCode).apply(25)).toBe(expected);
  });

  it('refuse un code promo invalide', () => {
    expect(() => pricings.promo('FAUX')).toThrow(expect.objectContaining({ code: 'INVALID_PROMO_CODE' }));
  });

  it('refuse une réduction inconnue lors de la commande', async () => {
    const carts = new CartService(new BrandRegistry([new DaMichele()]));
    const service = new OrderService({
      carts,
      validator: new NonEmptyCartValidator(),
      payments: {},
      pricings,
      listeners: [],
      orders: new InMemoryOrderRepository(),
      customers: { findById: async () => ({ id: 'alice', name: 'Alice' }) } as unknown as CustomerRepository,
    });
    carts.add('alice', { brandId: 'da-michele', pizza: 'Margherita', size: 'M' });

    await expect(
      service.place('alice', { zipCode: '75001', pricing: 'etudiant', paymentMethod: 'stripe' }),
    ).rejects.toThrow(expect.objectContaining({ code: 'UNKNOWN_PRICING' }));
  });
});
