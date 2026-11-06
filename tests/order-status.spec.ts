import { describe, expect, it, vi } from 'vitest';
import { Order } from '../src/domain/order/Order';

describe('Transitions de statut (State)', () => {
  it('pending -> paid -> delivered', () => {
    const order = new Order('42', 'client-1', new Date(), 'da-michele', [], 0);
    order.pay();
    order.deliver();
    expect(order.getStatus()).toBe('delivered');
  });

  it('pending -> cancelled', () => {
    const order = new Order('42', 'client-1', new Date(), 'da-michele', [], 0);
    order.cancel();
    expect(order.getStatus()).toBe('cancelled');
  });

  it('paid -> cancelled', () => {
    const order = new Order('42', 'client-1', new Date(), 'da-michele', [], 0);
    order.pay();
    order.cancel();
    expect(order.getStatus()).toBe('cancelled');
  });

  it('refuse pending -> delivered', () => {
    expect(() => new Order('42', 'client-1', new Date(), 'da-michele', [], 0).deliver()).toThrow('Transition pending -> delivered interdite');
  });

  it('refuse toute transition depuis delivered', () => {
    const order = new Order('42', 'client-1', new Date(), 'da-michele', [], 0);
    order.pay();
    order.deliver();
    expect(() => order.pay()).toThrow(/interdite/);
    expect(() => order.cancel()).toThrow(/interdite/);
  });

  it('refuse toute transition depuis cancelled', () => {
    const order = new Order('42', 'client-1', new Date(), 'da-michele', [], 0);
    order.cancel();
    expect(() => order.pay()).toThrow(/interdite/);
    expect(() => order.deliver()).toThrow(/interdite/);
  });

  it("ne change pas le statut et ne notifie pas en cas de refus", () => {
    const order = new Order('42', 'client-1', new Date(), 'da-michele', [], 0);
    const listener = { onStatusChanged: vi.fn() };
    order.subscribe(listener);

    expect(() => order.deliver()).toThrow();

    expect(order.getStatus()).toBe('pending');
    expect(listener.onStatusChanged).not.toHaveBeenCalled();
  });
});
