import { PaymentGateway } from '../application/ports/PaymentGateway';
import { BrandRegistry } from '../domain/brand/BrandRegistry';
import { DaMichele } from '../domain/brand/brands/DaMichele';
import { Pizzium } from '../domain/brand/brands/Pizzium';
import { Rossopomodoro } from '../domain/brand/brands/Rossopomodoro';
import { CardPaymentAdapter } from '../infrastructure/payment/CardPaymentAdapter';
import { CardTerminalPayment } from '../infrastructure/payment/CardTerminalPayment';
import { PaypalPayment } from '../infrastructure/payment/PaypalPayment';
import { StripePayment } from '../infrastructure/payment/StripePayment';
import { PaypalPaymentAdapter } from '../infrastructure/payment/PaypalPaymentAdapter';
import { StripePaymentAdapter } from '../infrastructure/payment/StripePaymentAdapter';

export const buildContainer = () => {
  const brands = new BrandRegistry([new DaMichele(), new Rossopomodoro(), new Pizzium()]);

  const payments: Record<string, PaymentGateway> = {
    stripe: new StripePaymentAdapter(new StripePayment()),
    paypal: new PaypalPaymentAdapter(new PaypalPayment()),
    card: new CardPaymentAdapter(new CardTerminalPayment()),
  };

  return { brands, payments };
};

export type Container = ReturnType<typeof buildContainer>;
