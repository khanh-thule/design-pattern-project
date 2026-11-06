import { PaymentGateway } from '../../application/ports/PaymentGateway';
import { PaypalPayment } from './PaypalPayment';

export class PaypalPaymentAdapter implements PaymentGateway {
  constructor(private readonly paypal: PaypalPayment) {}

  pay(amount: number): void {
    this.paypal.sendPayment({ total: amount, currency: 'EUR' });
  }
}
