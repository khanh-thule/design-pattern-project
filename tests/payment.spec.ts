import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomerRepository } from '../src/application/ports/CustomerRepository';
import { PaymentError, PaymentGateway } from '../src/application/ports/PaymentGateway';
import { CartService } from '../src/application/use-cases/CartService';
import { OrderService } from '../src/application/use-cases/OrderService';
import { NonEmptyCartValidator } from '../src/application/validation/NonEmptyCartValidator';
import { buildContainer } from '../src/config/container';
import { BrandRegistry } from '../src/domain/brand/BrandRegistry';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';
import { StandardPricing } from '../src/domain/pricing/StandardPricing';
import { StripePayment } from '../src/infrastructure/payment/StripePayment';
import { StripePaymentAdapter } from '../src/infrastructure/payment/StripePaymentAdapter';
import { InMemoryOrderRepository } from '../src/infrastructure/persistence/memory/InMemoryOrderRepository';

describe('US 4 - Paiement', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['stripe', '[Stripe] charge 25 EUR'],
    ['paypal', '[PayPal] sendPayment 25 EUR'],
    ['card', '[Carte] processTransaction EUR 25'],
  ])('passe dynamiquement par %s', (method, expectedLog) => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { payments } = buildContainer({ PORT: 3000, JWT_SECRET: 'x'.repeat(32) });

    payments[method].pay(25);

    expect(log).toHaveBeenCalledWith(expectedLog);
  });

  it("l'adapter traduit l'erreur du prestataire en PaymentError", () => {
    const stripe = new StripePayment();
    vi.spyOn(stripe, 'charge').mockImplementation(() => {
      throw new Error('Stripe indisponible');
    });

    expect(() => new StripePaymentAdapter(stripe).pay(25)).toThrow(PaymentError);
  });

  it("un paiement échoué ne crée pas la commande et garde le panier pour réessayer", async () => {
    const failing: PaymentGateway = {
      pay: () => {
        throw new PaymentError('Stripe');
      },
    };
    const customers = { findById: async () => ({ id: 'alice', name: 'Alice' }) } as unknown as CustomerRepository;
    const carts = new CartService(new BrandRegistry([new DaMichele()]));
    const orders = new InMemoryOrderRepository();
    const service = new OrderService({
      carts,
      validator: new NonEmptyCartValidator(),
      payments: { stripe: failing },
      pricings: { standard: () => new StandardPricing() },
      listeners: [],
      orders,
      customers,
    });
    carts.add('alice', { brandId: 'da-michele', pizza: 'Margherita', size: 'M' });

    await expect(
      service.place('alice', { zipCode: '75001', pricing: 'standard', paymentMethod: 'stripe' }),
    ).rejects.toThrow(PaymentError);

    expect(await orders.findByCustomer('alice')).toEqual([]);
    expect(carts.get('alice')?.cart.getPizzas()).toHaveLength(1);
  });
});
