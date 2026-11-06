import { OrderStatus } from '../../domain/order/OrderStatus';
import { OrderStatusListener } from '../../domain/order/OrderStatusListener';

export class SmsListener implements OrderStatusListener {
  onStatusChanged(orderId: string, status: OrderStatus): void {
    console.log(`[SMS] Commande ${orderId} : ${status}`);
  }
}
