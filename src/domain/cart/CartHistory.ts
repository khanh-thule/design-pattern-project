import { Cart, CartMemento } from './Cart';

export class CartHistory {
  private undoStack: CartMemento[] = [];
  private redoStack: CartMemento[] = [];

  constructor(
    private readonly cart: Cart,
    private readonly limit = 10,
  ) {}

  backup(): void {
    this.push(this.undoStack, this.cart.save());
    this.redoStack = [];
  }

  undo(): boolean {
    return this.move(this.undoStack, this.redoStack);
  }

  redo(): boolean {
    return this.move(this.redoStack, this.undoStack);
  }

  private move(from: CartMemento[], to: CartMemento[]): boolean {
    const memento = from.pop();
    if (!memento) return false;
    this.push(to, this.cart.save());
    this.cart.restore(memento);
    return true;
  }

  private push(stack: CartMemento[], memento: CartMemento): void {
    stack.push(memento);
    if (stack.length > this.limit) stack.shift();
  }
}
