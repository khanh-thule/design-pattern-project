import { DomainError } from '../../domain/shared/DomainError';
import { OrderDraft } from './OrderDraft';
import { OrderValidator } from './OrderValidator';

export class DeliveryZoneValidator extends OrderValidator {
  constructor(private readonly zipCodes: readonly string[]) {
    super();
  }

  protected check(draft: OrderDraft): void {
    if (!this.zipCodes.includes(draft.zipCode)) {
      throw new DomainError(`Le code postal ${draft.zipCode} n'est pas livré`, 'OUT_OF_DELIVERY_ZONE');
    }
  }
}
