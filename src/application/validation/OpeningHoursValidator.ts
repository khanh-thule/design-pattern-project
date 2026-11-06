import { DomainError } from '../../domain/shared/DomainError';
import { OrderDraft } from './OrderDraft';
import { OrderValidator } from './OrderValidator';

export class OpeningHoursValidator extends OrderValidator {
  constructor(
    private readonly openHour: number,
    private readonly closeHour: number,
  ) {
    super();
  }

  protected check(draft: OrderDraft): void {
    const hour = draft.date.getHours();
    if (hour < this.openHour || hour >= this.closeHour) {
      throw new DomainError("L'enseigne est fermée", 'BRAND_CLOSED');
    }
  }
}
