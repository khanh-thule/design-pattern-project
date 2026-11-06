import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildContainer } from '../src/config/container';

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
});
