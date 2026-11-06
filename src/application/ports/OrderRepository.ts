import { Order } from '../../domain/order/Order';
import { OrderStatus } from '../../domain/order/OrderStatus';

/** Port (Repository) : le métier ne sait pas où sont stockées les commandes. */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  /** Commandes du client, la plus récente en premier, filtrées par statut si fourni. */
  findByCustomer(customerId: string, status?: OrderStatus): Promise<Order[]>;
}
