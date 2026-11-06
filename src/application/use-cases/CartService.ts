import { BrandRegistry } from '../../domain/brand/BrandRegistry';
import { Pizzeria } from '../../domain/brand/Pizzeria';
import { Cart } from '../../domain/cart/Cart';
import { CartHistory } from '../../domain/cart/CartHistory';
import { Pizza, PizzaRecipe } from '../../domain/pizza/Pizza';
import { Size } from '../../domain/pizza/Size';
import { DomainError, NotFoundError } from '../../domain/shared/DomainError';

export type PizzaRequest = PizzaRecipe & { brandId: string };

export interface CartSession {
  readonly brand: Pizzeria;
  readonly cart: Cart;
  readonly history: CartHistory;
}

export class CartService {
  private readonly sessions = new Map<string, CartSession>();

  constructor(private readonly brands: BrandRegistry) {}

  get(customerId: string): CartSession | undefined {
    return this.sessions.get(customerId);
  }

  add(customerId: string, request: PizzaRequest): CartSession {
    const brand = this.brands.get(request.brandId);
    const pizza =
      'pizza' in request
        ? brand.orderPizza(request.pizza, request.size)
        : brand.customPizza(request.base, request.size, request.ingredients);

    const session = this.sessionFor(customerId, brand);
    session.history.backup();
    session.cart.add(pizza);
    return session;
  }

  changeSize(customerId: string, index: number, size: Size): CartSession {
    const session = this.existing(customerId);
    this.pizzaAt(session, index).withSize(size);
    session.history.backup();
    session.cart.changeSize(index, size);
    return session;
  }

  remove(customerId: string, index: number): CartSession {
    const session = this.existing(customerId);
    this.pizzaAt(session, index);
    session.history.backup();
    session.cart.remove(index);
    return session;
  }

  undo(customerId: string): CartSession {
    const session = this.existing(customerId);
    if (!session.history.undo()) throw new DomainError('Rien à annuler', 'NOTHING_TO_UNDO');
    return session;
  }

  redo(customerId: string): CartSession {
    const session = this.existing(customerId);
    if (!session.history.redo()) throw new DomainError('Rien à rétablir', 'NOTHING_TO_REDO');
    return session;
  }

  clear(customerId: string): void {
    this.sessions.delete(customerId);
  }

  /** Le premier ajout dans un panier vide fixe l'enseigne. */
  private sessionFor(customerId: string, brand: Pizzeria): CartSession {
    const current = this.sessions.get(customerId);
    if (current?.brand.id === brand.id) return current;
    if (current && current.cart.getPizzas().length > 0) {
      throw new DomainError(`Le panier contient déjà des pizzas de ${current.brand.name}`, 'BRAND_MISMATCH');
    }
    const cart = new Cart();
    const session = { brand, cart, history: new CartHistory(cart) };
    this.sessions.set(customerId, session);
    return session;
  }

  private existing(customerId: string): CartSession {
    const session = this.sessions.get(customerId);
    if (!session) throw new NotFoundError('Panier');
    return session;
  }

  private pizzaAt(session: CartSession, index: number): Pizza {
    const pizza = session.cart.getPizzas()[index];
    if (!pizza) throw new NotFoundError(`Pizza n°${index} du panier`);
    return pizza;
  }
}
