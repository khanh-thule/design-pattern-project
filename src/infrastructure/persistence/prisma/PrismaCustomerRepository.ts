import { PrismaClient } from '@prisma/client';
import { CustomerRepository } from '../../../application/ports/CustomerRepository';
import { Customer } from '../../../domain/customer/Customer';

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Customer[]> {
    const rows = await this.prisma.customer.findMany({ orderBy: { name: 'asc' } });
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    return row && { id: row.id, name: row.name };
  }

  async findPasswordHash(id: string): Promise<string | null> {
    const row = await this.prisma.customer.findUnique({ where: { id }, select: { passwordHash: true } });
    return row?.passwordHash ?? null;
  }
}
