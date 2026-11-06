import { describe, expect, it } from 'vitest';
import { DeliveryZoneValidator } from '../src/application/validation/DeliveryZoneValidator';
import { MinimumAmountValidator } from '../src/application/validation/MinimumAmountValidator';
import { NonEmptyCartValidator } from '../src/application/validation/NonEmptyCartValidator';
import { OpeningHoursValidator } from '../src/application/validation/OpeningHoursValidator';
import { OrderDraft } from '../src/application/validation/OrderDraft';
import { OrderValidator } from '../src/application/validation/OrderValidator';
import { StockValidator } from '../src/application/validation/StockValidator';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';

describe('Story 3 - Validation de commande', () => {
  const brand = new DaMichele();
  const margheritaL = brand.orderPizza('Margherita', 'L'); // 12 €
  const marinaraM = brand.orderPizza('Marinara', 'M'); // 8 €

  const buildChain = (): OrderValidator => {
    const chain = new NonEmptyCartValidator();
    chain
      .setNext(new MinimumAmountValidator(15))
      .setNext(new DeliveryZoneValidator(['75001', '75002']))
      .setNext(new OpeningHoursValidator(11, 23))
      .setNext(new StockValidator(['Marinara']));
    return chain;
  };

  const valid: OrderDraft = {
    pizzas: [margheritaL, brand.orderPizza('Margherita', 'M')], // 21 €
    zipCode: '75001',
    date: new Date('2026-11-06T19:00:00'),
  };

  it('accepte une commande valide', () => {
    expect(() => buildChain().validate(valid)).not.toThrow();
  });

  it('refuse un panier vide', () => {
    expect(() => buildChain().validate({ ...valid, pizzas: [] })).toThrow('Le panier est vide');
  });

  it('refuse un montant inférieur à 15 €', () => {
    expect(() => buildChain().validate({ ...valid, pizzas: [margheritaL] })).toThrow(/Montant minimum/);
  });

  it('refuse une adresse hors zone', () => {
    expect(() => buildChain().validate({ ...valid, zipCode: '13001' })).toThrow(/n'est pas livré/);
  });

  it('refuse une enseigne fermée', () => {
    expect(() => buildChain().validate({ ...valid, date: new Date('2026-11-06T03:00:00') })).toThrow(/fermée/);
  });

  it('refuse une pizza en rupture de stock', () => {
    expect(() => buildChain().validate({ ...valid, pizzas: [margheritaL, marinaraM] })).toThrow(/rupture/);
  });

  it("s'arrête à la première erreur", () => {
    const draft = { ...valid, pizzas: [], date: new Date('2026-11-06T03:00:00') };
    expect(() => buildChain().validate(draft)).toThrow('Le panier est vide');
  });
});
