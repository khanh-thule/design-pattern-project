import { NotFoundError } from '../shared/DomainError';
import { Pizza } from '../pizza/Pizza';
import { Size } from '../pizza/Size';

export interface CartMemento {}

class CartSnapshot implements CartMemento {
  constructor(readonly pizzas: readonly Pizza[]) {}
}

export class Cart {
  private pizzas: readonly Pizza[] = [];

  add(pizza: Pizza): void {
    this.pizzas = [...this.pizzas, pizza];
  }

  remove(index: number): void {
    this.checkIndex(index);
    this.pizzas = this.pizzas.filter((_, i) => i !== index);
  }

  changeSize(index: number, size: Size): void {
    this.checkIndex(index);
    this.pizzas = this.pizzas.map((pizza, i) => (i === index ? pizza.withSize(size) : pizza));
  }

  getPizzas(): readonly Pizza[] {
    return this.pizzas;
  }

  save(): CartMemento {
    return new CartSnapshot(this.pizzas);
  }

  restore(memento: CartMemento): void {
    if (!(memento instanceof CartSnapshot)) throw new Error('Memento de panier invalide');
    this.pizzas = memento.pizzas;
  }

  private checkIndex(index: number): void {
    if (index < 0 || index >= this.pizzas.length) throw new NotFoundError(`Pizza n°${index} du panier`);
  }
}
