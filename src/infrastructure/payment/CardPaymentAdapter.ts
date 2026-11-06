import { PaymentError, PaymentGateway } from '../../application/ports/PaymentGateway';
import { CardTerminalPayment } from './CardTerminalPayment';

export class CardPaymentAdapter implements PaymentGateway {
  constructor(private readonly terminal: CardTerminalPayment) {}

  pay(amount: number): void {
    try {
      this.terminal.processTransaction('EUR', amount);
    } catch {
      throw new PaymentError('par carte');
    }
  }
}
