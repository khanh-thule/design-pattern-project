import { OrderStatus } from '../OrderStatus';
import { CancelledState } from './CancelledState';
import { DeliveredState } from './DeliveredState';
import { OrderState } from './OrderState';
import { PaidState } from './PaidState';
import { PendingState } from './PendingState';

const STATES: Record<OrderStatus, () => OrderState> = {
  pending: () => new PendingState(),
  paid: () => new PaidState(),
  delivered: () => new DeliveredState(),
  cancelled: () => new CancelledState(),
};

export const stateFromStatus = (status: OrderStatus): OrderState => STATES[status]();
