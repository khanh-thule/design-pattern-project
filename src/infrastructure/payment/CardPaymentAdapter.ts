import { PaymentGateway } from '../../application/ports/PaymentGateway';
import { CardTerminalPayment } from './CardTerminalPayment';

export class CardPaymentAdapter implements PaymentGateway {
  constructor(private readonly terminal: CardTerminalPayment) {}

  pay(amount: number): void {
    this.terminal.processTransaction('EUR', amount);
  }
}
