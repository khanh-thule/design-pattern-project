import { randomUUID } from 'node:crypto';
import { Order } from '../../domain/order/Order';
import { OrderStatusListener } from '../../domain/order/OrderStatusListener';
import { HappyHourPricing } from '../../domain/pricing/HappyHourPricing';
import { LoyaltyPricing } from '../../domain/pricing/LoyaltyPricing';
import { PricingStrategy } from '../../domain/pricing/PricingStrategy';
import { PromoCodePricing } from '../../domain/pricing/PromoCodePricing';
import { StandardPricing } from '../../domain/pricing/StandardPricing';
import { DomainError, NotFoundError } from '../../domain/shared/DomainError';
import { CustomerRepository } from '../ports/CustomerRepository';
import { OrderRepository } from '../ports/OrderRepository';
import { PaymentGateway } from '../ports/PaymentGateway';
import { OrderValidator } from '../validation/OrderValidator';
import { CartService } from './CartService';

export const PRICINGS = ['standard', 'happy-hour', 'loyalty', 'promo'] as const;

export interface PlaceOrderInput {
  zipCode: string;
  pricing: (typeof PRICINGS)[number];
  promoCode?: string;
  paymentMethod: string;
}

export interface OrderServiceDeps {
  carts: CartService;
  validator: OrderValidator;
  payments: Record<string, PaymentGateway>;
  promoCodes: Record<string, number>;
  listeners: OrderStatusListener[];
  orders: OrderRepository;
  customers: CustomerRepository;
}

export class OrderService {
  constructor(private readonly deps: OrderServiceDeps) {}

  async place(customerId: string, input: PlaceOrderInput): Promise<{ order: Order; total: number }> {
    if (!(await this.deps.customers.findById(customerId))) throw new NotFoundError(`Client "${customerId}"`);

    const pizzas = this.deps.carts.get(customerId)?.cart.getPizzas() ?? [];
    this.deps.validator.validate({ pizzas, zipCode: input.zipCode, date: new Date() });

    const subtotal = pizzas.reduce((sum, pizza) => sum + pizza.price(), 0);
    const total = this.pricingFor(input).apply(subtotal);
    this.paymentFor(input.paymentMethod).pay(total);

    const order = this.withListeners(new Order(randomUUID(), customerId, new Date()));
    order.pay();
    await this.deps.orders.save(order);
    this.deps.carts.clear(customerId);

    return { order, total };
  }

  deliver(orderId: string): Promise<Order> {
    return this.transition(orderId, (order) => order.deliver());
  }

  cancel(orderId: string): Promise<Order> {
    return this.transition(orderId, (order) => order.cancel());
  }

  private async transition(orderId: string, change: (order: Order) => void): Promise<Order> {
    const order = await this.deps.orders.findById(orderId);
    if (!order) throw new NotFoundError(`Commande "${orderId}"`);
    change(this.withListeners(order));
    await this.deps.orders.save(order);
    return order;
  }

  private withListeners(order: Order): Order {
    this.deps.listeners.forEach((listener) => order.subscribe(listener));
    return order;
  }

  private pricingFor(input: PlaceOrderInput): PricingStrategy {
    switch (input.pricing) {
      case 'standard':
        return new StandardPricing();
      case 'happy-hour':
        return new HappyHourPricing();
      case 'loyalty':
        return new LoyaltyPricing();
      case 'promo': {
        const discount = this.deps.promoCodes[input.promoCode ?? ''];
        if (discount === undefined) throw new DomainError('Code promo invalide', 'INVALID_PROMO_CODE');
        return new PromoCodePricing(discount);
      }
    }
  }

  private paymentFor(method: string): PaymentGateway {
    const gateway = this.deps.payments[method];
    if (!gateway) throw new DomainError(`Moyen de paiement "${method}" inconnu`, 'UNKNOWN_PAYMENT_METHOD');
    return gateway;
  }
}
