import { beforeEach, describe, expect, it } from 'vitest';
import { Order } from '../src/domain/order/Order';
import { InMemoryOrderRepository } from '../src/infrastructure/persistence/memory/InMemoryOrderRepository';

describe('US 9 - Historique des commandes', () => {
  let orders: InMemoryOrderRepository;

  beforeEach(async () => {
    orders = new InMemoryOrderRepository();
    await orders.save(new Order('a', 'alice', new Date('2026-11-01'), 'delivered'));
    await orders.save(new Order('b', 'alice', new Date('2026-11-03'), 'cancelled'));
    await orders.save(new Order('c', 'alice', new Date('2026-11-02'), 'delivered'));
    await orders.save(new Order('d', 'bob', new Date('2026-11-04'), 'delivered'));
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
