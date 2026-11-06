import { CancelledState } from './CancelledState';
import { OrderState } from './OrderState';
import { PaidState } from './PaidState';

export class PendingState extends OrderState {
  readonly status = 'pending';

  override pay(): OrderState {
    return new PaidState();
  }

  override cancel(): OrderState {
    return new CancelledState();
  }
}
