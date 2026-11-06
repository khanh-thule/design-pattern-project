import { Order as OrderRow, PrismaClient } from '@prisma/client';
import { OrderRepository } from '../../../application/ports/OrderRepository';
import { Order } from '../../../domain/order/Order';
import { OrderLine } from '../../../domain/order/OrderLine';
import { OrderStatus } from '../../../domain/order/OrderStatus';

const toDomain = (row: OrderRow): Order =>
  new Order(row.id, row.customerId, row.createdAt, row.brandId, row.lines as OrderLine[], row.total, row.status);

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        customerId: order.customerId,
        brandId: order.brandId,
        lines: [...order.lines],
        total: order.total,
        status: order.getStatus(),
        createdAt: order.createdAt,
      },
      update: { status: order.getStatus() },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({ where: { id } });
    return row && toDomain(row);
  }

  async findByCustomer(customerId: string, status?: OrderStatus): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { customerId, status },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDomain);
  }
}
