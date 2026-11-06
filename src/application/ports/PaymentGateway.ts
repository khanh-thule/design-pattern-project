export interface PaymentGateway {
  pay(amount: number): void;
}
