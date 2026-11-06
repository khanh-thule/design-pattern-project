import { DomainError } from '../../shared/DomainError';
import { OrderStatus } from '../OrderStatus';

export abstract class OrderState {
  abstract readonly status: OrderStatus;

  pay(): OrderState {
    throw this.forbidden('paid');
  }

  deliver(): OrderState {
    throw this.forbidden('delivered');
  }

  cancel(): OrderState {
    throw this.forbidden('cancelled');
  }

  private forbidden(target: OrderStatus): DomainError {
    return new DomainError(`Transition ${this.status} -> ${target} interdite`, 'INVALID_TRANSITION');
  }
}
