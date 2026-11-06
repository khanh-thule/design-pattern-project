import { CustomerRepository } from '../application/ports/CustomerRepository';
import { OrderRepository } from '../application/ports/OrderRepository';
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
import { createPrismaClient } from '../infrastructure/persistence/prisma/prismaClient';
import { PrismaCustomerRepository } from '../infrastructure/persistence/prisma/PrismaCustomerRepository';
import { PrismaOrderRepository } from '../infrastructure/persistence/prisma/PrismaOrderRepository';

export const buildContainer = () => {
  const brands = new BrandRegistry([new DaMichele(), new Rossopomodoro(), new Pizzium()]);

  const payments: Record<string, PaymentGateway> = {
    stripe: new StripePaymentAdapter(new StripePayment()),
    paypal: new PaypalPaymentAdapter(new PaypalPayment()),
    card: new CardPaymentAdapter(new CardTerminalPayment()),
  };

  const prisma = createPrismaClient();
  const customers: CustomerRepository = new PrismaCustomerRepository(prisma);
  const orders: OrderRepository = new PrismaOrderRepository(prisma);

  return { brands, payments, customers, orders };
};

export type Container = ReturnType<typeof buildContainer>;
