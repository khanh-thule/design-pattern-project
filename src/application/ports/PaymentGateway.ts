export interface PaymentGateway {
  pay(amount: number): void;
}

export class PaymentError extends Error {
  readonly code = 'PAYMENT_FAILED';

  constructor(provider: string) {
    super(`Le paiement ${provider} a échoué, réessayez avec un autre moyen de paiement`);
    this.name = 'PaymentError';
  }
}
