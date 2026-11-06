import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../src/domain/order/Order';
import { OrderStatus } from '../src/domain/order/OrderStatus';
import { OrderStatusListener } from '../src/domain/order/OrderStatusListener';
import { EmailListener } from '../src/infrastructure/notifications/EmailListener';
import { SmsListener } from '../src/infrastructure/notifications/SmsListener';

describe('US 5 - Notifications', () => {
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('notifie tous les listeners quand le statut change', () => {
    const order = new Order('42');
    order.subscribe(new EmailListener());
    order.subscribe(new SmsListener());

    order.pay();

    expect(order.getStatus()).toBe('paid');
    expect(log).toHaveBeenCalledWith('[Email] Commande 42 : paid');
    expect(log).toHaveBeenCalledWith('[SMS] Commande 42 : paid');
  });

  it("ne notifie plus un listener désactivé", () => {
    const order = new Order('42');
    const sms = new SmsListener();
    order.subscribe(new EmailListener());
    order.subscribe(sms);

    order.unsubscribe(sms);
    order.pay();

    expect(log).toHaveBeenCalledWith('[Email] Commande 42 : paid');
    expect(log).not.toHaveBeenCalledWith('[SMS] Commande 42 : paid');
  });

  it('accepte un nouveau listener sans modifier Order', () => {
    class PushListener implements OrderStatusListener {
      onStatusChanged(orderId: string, status: OrderStatus): void {
        console.log(`[Push] Commande ${orderId} : ${status}`);
      }
    }
    const order = new Order('42');
    order.subscribe(new PushListener());

    order.cancel();

    expect(log).toHaveBeenCalledWith('[Push] Commande 42 : cancelled');
  });
});
