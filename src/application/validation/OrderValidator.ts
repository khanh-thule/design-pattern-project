import { OrderDraft } from './OrderDraft';

export abstract class OrderValidator {
  private next?: OrderValidator;

  setNext(next: OrderValidator): OrderValidator {
    this.next = next;
    return next;
  }

  validate(draft: OrderDraft): void {
    this.check(draft);
    this.next?.validate(draft);
  }

  protected abstract check(draft: OrderDraft): void;
}
