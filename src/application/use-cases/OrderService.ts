import { randomUUID } from 'node:crypto';
import { Order } from '../../domain/order/Order';
import { OrderStatusListener } from '../../domain/order/OrderStatusListener';
import { PricingFactory, PricingStrategy } from '../../domain/pricing/PricingStrategy';
import { DomainError, NotFoundError } from '../../domain/shared/DomainError';
import { CustomerRepository } from '../ports/CustomerRepository';
import { OrderRepository } from '../ports/OrderRepository';
import { PaymentGateway } from '../ports/PaymentGateway';
import { OrderValidator } from '../validation/OrderValidator';
import { CartService, CartSession } from './CartService';

export interface PlaceOrderInput {
  zipCode: string;
  pricing: string;
  promoCode?: string;
  paymentMethod: string;
}

export interface OrderServiceDeps {
  carts: CartService;
  validator: OrderValidator;
  payments: Record<string, PaymentGateway>;
  pricings: Record<string, PricingFactory>;
  listeners: OrderStatusListener[];
  orders: OrderRepository;
  customers: CustomerRepository;
}

export class OrderService {
  constructor(private readonly deps: OrderServiceDeps) {}

  async place(customerId: string, input: PlaceOrderInput): Promise<Order> {
    if (!(await this.deps.customers.findById(customerId))) throw new NotFoundError(`Client "${customerId}"`);

    const session = this.deps.carts.get(customerId);
    const pizzas = session?.cart.getPizzas() ?? [];
    this.deps.validator.validate({ pizzas, zipCode: input.zipCode, date: new Date() });

    const subtotal = pizzas.reduce((sum, pizza) => sum + pizza.price(), 0);
    const total = this.pricingFor(input).apply(subtotal);
    this.paymentFor(input.paymentMethod).pay(total);

    const lines = pizzas.map((pizza) => ({ ...pizza.recipe(), label: pizza.label, price: pizza.price() }));
    const order = this.withListeners(new Order(randomUUID(), customerId, new Date(), session!.brand.id, lines, total));
    order.pay();
    await this.deps.orders.save(order);
    this.deps.carts.clear(customerId);

    return order;
  }

  async find(customerId: string, orderId: string): Promise<Order> {
    const order = await this.deps.orders.findById(orderId);
    if (!order || order.customerId !== customerId) throw new NotFoundError(`Commande "${orderId}"`);
    return order;
  }

  async reorder(customerId: string, orderId: string): Promise<CartSession | undefined> {
    const order = await this.find(customerId, orderId);
    this.deps.carts.clear(customerId);
    order.lines.forEach((line) => this.deps.carts.add(customerId, { ...line, brandId: order.brandId }));
    return this.deps.carts.get(customerId);
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
    const factory = this.deps.pricings[input.pricing];
    if (!factory) throw new DomainError(`Réduction "${input.pricing}" inconnue`, 'UNKNOWN_PRICING');
    return factory(input.promoCode);
  }

  private paymentFor(method: string): PaymentGateway {
    const gateway = this.deps.payments[method];
    if (!gateway) throw new DomainError(`Moyen de paiement "${method}" inconnu`, 'UNKNOWN_PAYMENT_METHOD');
    return gateway;
  }
}
