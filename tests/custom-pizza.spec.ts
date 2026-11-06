import { describe, expect, it } from 'vitest';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';
import { Pizzium } from '../src/domain/brand/brands/Pizzium';
import { Rossopomodoro } from '../src/domain/brand/brands/Rossopomodoro';
import { Cart } from '../src/domain/cart/Cart';
import { CartHistory } from '../src/domain/cart/CartHistory';

describe('US 8 - Pizza personnalisée', () => {
  const daMichele = new DaMichele();

  it('base seule : 5 €', () => {
    expect(daMichele.customPizza('cream', 'M', []).price()).toBe(5);
  });

  it('base + ingrédients : 5 + 1,50 + 2 = 8,50 €', () => {
    expect(daMichele.customPizza('tomato', 'M', ['mozzarella', 'pepperoni']).price()).toBe(8.5);
  });

  it('taille selon Da Michele (L : +3)', () => {
    expect(daMichele.customPizza('tomato', 'L', ['mozzarella', 'pepperoni']).price()).toBe(11.5);
  });

  it('taille selon Rossopomodoro (L : x1,3)', () => {
    expect(new Rossopomodoro().customPizza('tomato', 'L', ['mozzarella', 'pepperoni']).price()).toBe(11.05);
  });

  it('taille refusée chez Pizzium (taille unique M)', () => {
    expect(() => new Pizzium().customPizza('tomato', 'L', ['olives'])).toThrow(/indisponible/);
  });

  it('se met dans le panier comme une pizza du menu', () => {
    const cart = new Cart();
    const history = new CartHistory(cart);
    cart.add(daMichele.customPizza('tomato', 'M', ['jambon', 'champignons']));

    history.backup();
    cart.changeSize(0, 'XL');
    expect(cart.getPizzas()[0].price()).toBe(13);

    history.undo();
    expect(cart.getPizzas()[0].price()).toBe(8);
  });
});
