export class CardTerminalPayment {
  processTransaction(currency: string, amount: number): void {
    console.log(`[Carte] processTransaction ${currency} ${amount}`);
  }
}
