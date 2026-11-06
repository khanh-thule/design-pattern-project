import { OrderRepository } from '../../../application/ports/OrderRepository';
import { Order } from '../../../domain/order/Order';
import { OrderStatus } from '../../../domain/order/OrderStatus';

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }

  async findByCustomer(customerId: string, status?: OrderStatus): Promise<Order[]> {
    return [...this.orders.values()]
      .filter((order) => order.customerId === customerId)
      .filter((order) => status === undefined || order.getStatus() === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
