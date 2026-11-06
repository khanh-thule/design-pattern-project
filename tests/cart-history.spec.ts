import { describe, expect, it } from 'vitest';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';
import { Cart } from '../src/domain/cart/Cart';
import { CartHistory } from '../src/domain/cart/CartHistory';

describe('US 6 - Annuler les modifications du panier', () => {
  const brand = new DaMichele();
  const margherita = brand.orderPizza('Margherita', 'M');

  const setup = () => {
    const cart = new Cart();
    return { cart, history: new CartHistory(cart) };
  };

  const labels = (cart: Cart) => cart.getPizzas().map((p) => `${p.label} ${p.size}`);

  it('annule un ajout', () => {
    const { cart, history } = setup();
    history.backup();
    cart.add(margherita);

    history.undo();

    expect(labels(cart)).toEqual([]);
  });

  it('annule une suppression', () => {
    const { cart, history } = setup();
    cart.add(margherita);
    history.backup();
    cart.remove(0);

    history.undo();

    expect(labels(cart)).toEqual(['Margherita M']);
  });

  it('annule un changement de taille', () => {
    const { cart, history } = setup();
    cart.add(margherita);
    history.backup();
    cart.changeSize(0, 'XL');

    history.undo();

    expect(labels(cart)).toEqual(['Margherita M']);
  });

  it('rétablit une annulation', () => {
    const { cart, history } = setup();
    history.backup();
    cart.add(margherita);
    history.undo();

    history.redo();

    expect(labels(cart)).toEqual(['Margherita M']);
  });

  it('vide le redo après une nouvelle modification', () => {
    const { cart, history } = setup();
    history.backup();
    cart.add(margherita);
    history.undo();

    history.backup();
    cart.add(brand.orderPizza('Marinara', 'L'));

    expect(history.redo()).toBe(false);
    expect(labels(cart)).toEqual(['Marinara L']);
  });

  it('garde au maximum les 10 dernières modifications', () => {
    const { cart, history } = setup();
    for (let i = 0; i < 11; i++) {
      history.backup();
      cart.add(margherita);
    }

    let undos = 0;
    while (history.undo()) undos++;

    expect(undos).toBe(10);
    expect(cart.getPizzas()).toHaveLength(1);
  });

  it('ne fait rien sans historique', () => {
    const { cart, history } = setup();
    cart.add(margherita);

    expect(history.undo()).toBe(false);
    expect(labels(cart)).toEqual(['Margherita M']);
  });
});
