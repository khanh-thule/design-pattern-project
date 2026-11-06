import { PaymentError, PaymentGateway } from '../../application/ports/PaymentGateway';
import { PaypalPayment } from './PaypalPayment';

export class PaypalPaymentAdapter implements PaymentGateway {
  constructor(private readonly paypal: PaypalPayment) {}

  pay(amount: number): void {
    try {
      this.paypal.sendPayment({ total: amount, currency: 'EUR' });
    } catch {
      throw new PaymentError('PayPal');
    }
  }
}
