import { CancelledState } from './CancelledState';
import { DeliveredState } from './DeliveredState';
import { OrderState } from './OrderState';

export class PaidState extends OrderState {
  readonly status = 'paid';

  override deliver(): OrderState {
    return new DeliveredState();
  }

  override cancel(): OrderState {
    return new CancelledState();
  }
}
