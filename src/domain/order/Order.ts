import { OrderStatus } from './OrderStatus';
import { OrderStatusListener } from './OrderStatusListener';
import { OrderState } from './states/OrderState';
import { PendingState } from './states/PendingState';

export class Order {
  private state: OrderState = new PendingState();
  private readonly listeners = new Set<OrderStatusListener>();

  constructor(readonly id: string) {}

  subscribe(listener: OrderStatusListener): void {
    this.listeners.add(listener);
  }

  unsubscribe(listener: OrderStatusListener): void {
    this.listeners.delete(listener);
  }

  getStatus(): OrderStatus {
    return this.state.status;
  }

  pay(): void {
    this.transitionTo(this.state.pay());
  }

  deliver(): void {
    this.transitionTo(this.state.deliver());
  }

  cancel(): void {
    this.transitionTo(this.state.cancel());
  }

  private transitionTo(next: OrderState): void {
    this.state = next;
    this.listeners.forEach((listener) => listener.onStatusChanged(this.id, next.status));
  }
}
