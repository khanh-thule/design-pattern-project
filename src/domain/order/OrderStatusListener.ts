import { OrderStatus } from './OrderStatus';

export interface OrderStatusListener {
  onStatusChanged(orderId: string, status: OrderStatus): void;
}
