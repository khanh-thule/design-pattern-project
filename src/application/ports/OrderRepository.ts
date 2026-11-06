import { Order } from '../../domain/order/Order';
import { OrderStatus } from '../../domain/order/OrderStatus';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;

  findByCustomer(customerId: string, status?: OrderStatus): Promise<Order[]>;
}
