import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const customers = [
  { id: 'alice', name: 'Alice Martin' },
  { id: 'bob', name: 'Bob Durand' },
  { id: 'charlie', name: 'Charlie Bernard' },
];

const orders = [
  { id: 'order-1', customerId: 'alice', status: 'delivered', createdAt: new Date('2026-11-01T19:30:00Z') },
  { id: 'order-2', customerId: 'alice', status: 'cancelled', createdAt: new Date('2026-11-03T20:00:00Z') },
  { id: 'order-3', customerId: 'alice', status: 'paid', createdAt: new Date('2026-11-05T12:15:00Z') },
  { id: 'order-4', customerId: 'bob', status: 'delivered', createdAt: new Date('2026-11-02T18:45:00Z') },
  { id: 'order-5', customerId: 'bob', status: 'pending', createdAt: new Date('2026-11-06T11:00:00Z') },
] as const;

const main = async () => {
  for (const customer of customers) {
    await prisma.customer.upsert({ where: { id: customer.id }, create: customer, update: { name: customer.name } });
  }
  for (const order of orders) {
    await prisma.order.upsert({ where: { id: order.id }, create: order, update: { status: order.status } });
  }
  console.log(`${customers.length} clients et ${orders.length} commandes insérés`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
