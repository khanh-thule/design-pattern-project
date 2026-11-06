import { beforeEach, describe, expect, it } from 'vitest';
import { CustomerRepository } from '../src/application/ports/CustomerRepository';
import { CartService } from '../src/application/use-cases/CartService';
import { OrderService } from '../src/application/use-cases/OrderService';
import { NonEmptyCartValidator } from '../src/application/validation/NonEmptyCartValidator';
import { BrandRegistry } from '../src/domain/brand/BrandRegistry';
import { DaMichele } from '../src/domain/brand/brands/DaMichele';
import { Pizzium } from '../src/domain/brand/brands/Pizzium';
import { Order } from '../src/domain/order/Order';
import { OrderLine } from '../src/domain/order/OrderLine';
import { InMemoryOrderRepository } from '../src/infrastructure/persistence/memory/InMemoryOrderRepository';

describe('US 9 - Historique des commandes', () => {
  let orders: InMemoryOrderRepository;

  beforeEach(async () => {
    orders = new InMemoryOrderRepository();
    await orders.save(new Order('a', 'alice', new Date('2026-11-01'), 'da-michele', [], 0, 'delivered'));
    await orders.save(new Order('b', 'alice', new Date('2026-11-03'), 'da-michele', [], 0, 'cancelled'));
    await orders.save(new Order('c', 'alice', new Date('2026-11-02'), 'da-michele', [], 0, 'delivered'));
    await orders.save(new Order('d', 'bob', new Date('2026-11-04'), 'da-michele', [], 0, 'delivered'));
  });

  const ids = (list: Order[]) => list.map((o) => o.id);

  it('liste les commandes du client, la plus récente en premier', async () => {
    expect(ids(await orders.findByCustomer('alice'))).toEqual(['b', 'c', 'a']);
  });

  it('filtre par statut', async () => {
    expect(ids(await orders.findByCustomer('alice', 'delivered'))).toEqual(['c', 'a']);
  });

  it('renvoie une liste vide pour un client sans commande', async () => {
    expect(await orders.findByCustomer('charlie')).toEqual([]);
  });

  it('recrée la commande dans son statut (State)', async () => {
    const [delivered] = await orders.findByCustomer('alice', 'delivered');
    expect(() => delivered.pay()).toThrow(/interdite/);
  });
});

describe('US 9 - Recommander', () => {
  const lines: OrderLine[] = [
    { pizza: 'Margherita', size: 'XL', label: 'Margherita', price: 14 },
    { base: 'tomato', size: 'M', ingredients: ['mozzarella', 'champignons'], label: 'Pizza personnalisée', price: 7.5 },
  ];
  let carts: CartService;
  let service: OrderService;

  beforeEach(async () => {
    const orders = new InMemoryOrderRepository();
    await orders.save(new Order('o1', 'bob', new Date('2026-11-02'), 'da-michele', lines, 21.5, 'delivered'));
    carts = new CartService(new BrandRegistry([new DaMichele(), new Pizzium()]));
    service = new OrderService({
      carts,
      validator: new NonEmptyCartValidator(),
      payments: {},
      pricings: {},
      listeners: [],
      orders,
      customers: {} as CustomerRepository,
    });
  });

  it('remplit le panier avec les pizzas de la commande', async () => {
    const session = await service.reorder('bob', 'o1');

    expect(session?.brand.id).toBe('da-michele');
    expect(session?.cart.getPizzas().map((pizza) => [pizza.label, pizza.size, pizza.price()])).toEqual([
      ['Margherita', 'XL', 14],
      ['Pizza personnalisée', 'M', 7.5],
    ]);
  });

  it('remplace le panier en cours, même d\'une autre enseigne', async () => {
    carts.add('bob', { brandId: 'pizzium', pizza: 'Napolitaine', size: 'M' });

    const session = await service.reorder('bob', 'o1');

    expect(session?.cart.getPizzas()).toHaveLength(2);
  });

  it("refuse de recommander la commande d'un autre client", async () => {
    await expect(service.reorder('alice', 'o1')).rejects.toThrow(/introuvable/);
  });
});
