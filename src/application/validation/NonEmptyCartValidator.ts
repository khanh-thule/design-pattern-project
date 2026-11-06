import { DomainError } from '../../domain/shared/DomainError';
import { OrderDraft } from './OrderDraft';
import { OrderValidator } from './OrderValidator';

export class NonEmptyCartValidator extends OrderValidator {
  protected check(draft: OrderDraft): void {
    if (draft.pizzas.length === 0) {
      throw new DomainError('Le panier est vide', 'EMPTY_CART');
    }
  }
}
