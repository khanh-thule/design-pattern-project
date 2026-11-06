import { OrderState } from './OrderState';

export class CancelledState extends OrderState {
  readonly status = 'cancelled';
}
