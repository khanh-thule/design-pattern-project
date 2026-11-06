import { PaymentError, PaymentGateway } from '../../application/ports/PaymentGateway';
import { StripePayment } from './StripePayment';

export class StripePaymentAdapter implements PaymentGateway {
  constructor(private readonly stripe: StripePayment) {}

  pay(amount: number): void {
    try {
      this.stripe.charge(amount, 'EUR');
    } catch {
      throw new PaymentError('Stripe');
    }
  }
}
