import { DomainError } from '../../domain/shared/DomainError';
import { OrderDraft } from './OrderDraft';
import { OrderValidator } from './OrderValidator';

export class StockValidator extends OrderValidator {
  constructor(private readonly outOfStock: readonly string[]) {
    super();
  }

  protected check(draft: OrderDraft): void {
    const missing = draft.pizzas.find((pizza) => this.outOfStock.includes(pizza.label));
    if (missing) {
      throw new DomainError(`${missing.label} est en rupture de stock`, 'OUT_OF_STOCK');
    }
  }
}
