import { PaymentGateway } from '../../application/ports/PaymentGateway';
import { StripePayment } from './StripePayment';

export class StripePaymentAdapter implements PaymentGateway {
  constructor(private readonly stripe: StripePayment) {}

  pay(amount: number): void {
    this.stripe.charge(amount, 'EUR');
  }
}
