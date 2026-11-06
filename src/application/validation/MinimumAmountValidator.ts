import { subtotal } from '../../domain/pizza/subtotal';
import { DomainError } from '../../domain/shared/DomainError';
import { OrderDraft } from './OrderDraft';
import { OrderValidator } from './OrderValidator';

export class MinimumAmountValidator extends OrderValidator {
  constructor(private readonly minimum: number) {
    super();
  }

  protected check(draft: OrderDraft): void {
    if (subtotal(draft.pizzas) < this.minimum) {
      throw new DomainError(`Montant minimum de ${this.minimum} € non atteint`, 'MINIMUM_AMOUNT');
    }
  }
}
