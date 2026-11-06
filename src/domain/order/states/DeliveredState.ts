import { OrderState } from './OrderState';

export class DeliveredState extends OrderState {
  readonly status = 'delivered';
}
