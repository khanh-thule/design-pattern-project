export class StripePayment {
  charge(amount: number, currency: string): void {
    console.log(`[Stripe] charge ${amount} ${currency}`);
  }
}
