import { CustomerRepository } from '../application/ports/CustomerRepository';
import { OrderRepository } from '../application/ports/OrderRepository';
import { PaymentGateway } from '../application/ports/PaymentGateway';
import { AuthService } from '../application/use-cases/AuthService';
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
import { HappyHourPricing } from '../domain/pricing/HappyHourPricing';
import { LoyaltyPricing } from '../domain/pricing/LoyaltyPricing';
import { PricingFactory } from '../domain/pricing/PricingStrategy';
import { PromoCodePricing } from '../domain/pricing/PromoCodePricing';
import { StandardPricing } from '../domain/pricing/StandardPricing';
import { DomainError } from '../domain/shared/DomainError';
import { BcryptPasswordHasher } from '../infrastructure/auth/BcryptPasswordHasher';
import { JwtTokenService } from '../infrastructure/auth/JwtTokenService';
import { EmailListener } from '../infrastructure/notifications/EmailListener';
import { SmsListener } from '../infrastructure/notifications/SmsListener';
import { CardPaymentAdapter } from '../infrastructure/payment/CardPaymentAdapter';
import { CardTerminalPayment } from '../infrastructure/payment/CardTerminalPayment';
import { PaypalPayment } from '../infrastructure/payment/PaypalPayment';
import { StripePayment } from '../infrastructure/payment/StripePayment';
import { PaypalPaymentAdapter } from '../infrastructure/payment/PaypalPaymentAdapter';
import { StripePaymentAdapter } from '../infrastructure/payment/StripePaymentAdapter';
import { Env } from './env';
import { createPrismaClient } from '../infrastructure/persistence/prisma/prismaClient';
import { PrismaCustomerRepository } from '../infrastructure/persistence/prisma/PrismaCustomerRepository';
import { PrismaOrderRepository } from '../infrastructure/persistence/prisma/PrismaOrderRepository';

export const buildContainer = (env: Env) => {
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

  const promoCodes: Record<string, number> = { PIZZA5: 5 };
  const pricings: Record<string, PricingFactory> = {
    standard: () => new StandardPricing(),
    'happy-hour': () => new HappyHourPricing(),
    loyalty: () => new LoyaltyPricing(),
    promo: (code) => {
      const discount = promoCodes[code ?? ''];
      if (discount === undefined) throw new DomainError('Code promo invalide', 'INVALID_PROMO_CODE');
      return new PromoCodePricing(discount);
    },
  };

  const carts = new CartService(brands);
  const orderService = new OrderService({
    carts,
    validator,
    payments,
    pricings,
    listeners: [new EmailListener(), new SmsListener()],
    orders,
    customers,
  });

  const auth = new AuthService(customers, new BcryptPasswordHasher(), new JwtTokenService(env.JWT_SECRET));

  return { brands, payments, customers, orders, carts, orderService, auth };
};

export type Container = ReturnType<typeof buildContainer>;
