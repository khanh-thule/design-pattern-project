import { describe, expect, it } from 'vitest';
import { BrandRegistry } from '../src/domain/brand/BrandRegistry';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';
import { Pizzium } from '../src/domain/brand/brands/Pizzium';
import { Rossopomodoro } from '../src/domain/brand/brands/Rossopomodoro';
import { MenuEntry, Pizzeria } from '../src/domain/brand/Pizzeria';
import { AdditiveSizePricing, SizePricingRule } from '../src/domain/pizza/SizePricingRule';

describe('US 1 - Enseignes et pizzas', () => {
  const registry = new BrandRegistry([new DaMichele(), new Rossopomodoro(), new Pizzium()]);

  it('propose les 3 enseignes', () => {
    expect(registry.list().map((b) => b.id)).toEqual(['da-michele', 'rossopomodoro', 'pizzium']);
  });

  describe('Da Michele (additif)', () => {
    const brand = registry.get('da-michele');
    it.each([
      ['S', 7],
      ['M', 9],
      ['L', 12],
      ['XL', 14],
    ] as const)('Margherita %s = %d €', (size, price) => {
      expect(brand.orderPizza('Margherita', size).price()).toBe(price);
    });
  });

  describe('Rossopomodoro (multiplicatif)', () => {
    const brand = registry.get('rossopomodoro');
    it.each([
      ['S', 9.6],
      ['M', 12],
      ['L', 15.6],
      ['XL', 18],
    ] as const)('Supreme %s = %s €', (size, price) => {
      expect(brand.orderPizza('Supreme', size).price()).toBe(price);
    });
  });

  describe('Pizzium (taille unique)', () => {
    const brand = registry.get('pizzium');
    it('Napolitaine M = 10 €', () => {
      expect(brand.orderPizza('Napolitaine', 'M').price()).toBe(10);
    });
    it('refuse une autre taille que M', () => {
      expect(() => brand.orderPizza('Napolitaine', 'L')).toThrow(/indisponible/);
    });
  });

  it('refuse une pizza absente du menu', () => {
    expect(() => registry.get('pizzium').orderPizza('Margherita', 'M')).toThrow(/pas au menu/);
  });

  it('refuse une enseigne inconnue', () => {
    expect(() => registry.get('dominos')).toThrow(/introuvable/);
  });

  it('ajouter une enseigne = ajouter une classe', () => {
    class BigMamma extends Pizzeria {
      readonly id = 'big-mamma';
      readonly name = 'Big Mamma';
      protected createMenu(): MenuEntry[] {
        return [{ name: 'Truffe', basePrice: 15 }];
      }
      protected createSizePricingRule(): SizePricingRule {
        return new AdditiveSizePricing({ S: -3, M: 0, L: 4, XL: 6 });
      }
    }

    registry.register(new BigMamma());
    expect(registry.get('big-mamma').orderPizza('Truffe', 'L').price()).toBe(19);
  });
});
