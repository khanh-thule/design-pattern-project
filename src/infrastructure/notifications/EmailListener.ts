import { OrderStatus } from '../../domain/order/OrderStatus';
import { OrderStatusListener } from '../../domain/order/OrderStatusListener';

export class EmailListener implements OrderStatusListener {
  onStatusChanged(orderId: string, status: OrderStatus): void {
    console.log(`[Email] Commande ${orderId} : ${status}`);
  }
}
