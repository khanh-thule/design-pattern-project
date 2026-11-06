export class PaypalPayment {
  sendPayment(payload: { total: number; currency: string }): void {
    console.log(`[PayPal] sendPayment ${payload.total} ${payload.currency}`);
  }
}
