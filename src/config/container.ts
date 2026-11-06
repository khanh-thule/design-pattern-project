import { CustomerRepository } from '../application/ports/CustomerRepository';
import { OrderRepository } from '../application/ports/OrderRepository';
import { PaymentGateway } from '../application/ports/PaymentGateway';
import { CartService } from '../application/use-cases/CartService';
import { OrderService } from '../application/use-cases/OrderService';
import { DeliveryZoneValidator } from '../application/validation/DeliveryZoneValidator';
import { MinimumAmountValidator } from '../application/validation/MinimumAmountValidator';
import { NonEmptyCartValidator } from '../application/validation/NonEmptyCartValidator';
import { OpeningHoursValidator } from '../application/validation/OpeningHoursValidator';
import { StockValidator } from '../application/validation/StockValidator';
import { BrandRegistry } from '../domain/brand/BrandRegistry';
import { DaMichele } from '../domain/brand/brands/DaMichele';
import { Pizzium } from '../domain/brand/brands/Pizzium';
import { Rossopomodoro } from '../domain/brand/brands/Rossopomodoro';
import { EmailListener } from '../infrastructure/notifications/EmailListener';
import { SmsListener } from '../infrastructure/notifications/SmsListener';
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

  const validator = new NonEmptyCartValidator();
  validator
    .setNext(new MinimumAmountValidator(15))
    .setNext(new DeliveryZoneValidator(['75001', '75002', '75003']))
    .setNext(new OpeningHoursValidator(11, 23))
    .setNext(new StockValidator([]));

  const carts = new CartService(brands);
  const orderService = new OrderService({
    carts,
    validator,
    payments,
    promoCodes: { PIZZA5: 5 },
    listeners: [new EmailListener(), new SmsListener()],
    orders,
    customers,
  });

  return { brands, payments, customers, orders, carts, orderService };
};

export type Container = ReturnType<typeof buildContainer>;
