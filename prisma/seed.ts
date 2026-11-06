import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const customers = [
  { id: 'alice', name: 'Alice Martin' },
  { id: 'bob', name: 'Bob Durand' },
  { id: 'charlie', name: 'Charlie Bernard' },
];

const orders = [
  {
    id: 'order-1', customerId: 'alice', status: 'delivered', createdAt: new Date('2026-11-01T19:30:00Z'),
    brandId: 'da-michele', total: 20,
    lines: [
      { pizza: 'Margherita', size: 'L', label: 'Margherita', price: 12 },
      { pizza: 'Marinara', size: 'M', label: 'Marinara', price: 8 },
    ],
  },
  {
    id: 'order-2', customerId: 'alice', status: 'cancelled', createdAt: new Date('2026-11-03T20:00:00Z'),
    brandId: 'rossopomodoro', total: 26.3,
    lines: [
      { pizza: 'Supreme', size: 'M', label: 'Supreme', price: 12 },
      { pizza: 'Diavola', size: 'L', label: 'Diavola', price: 14.3 },
    ],
  },
  {
    id: 'order-3', customerId: 'alice', status: 'paid', createdAt: new Date('2026-11-05T12:15:00Z'),
    brandId: 'pizzium', total: 22,
    lines: [
      { pizza: 'Napolitaine', size: 'M', label: 'Napolitaine', price: 10 },
      { pizza: 'Quattro Formaggi', size: 'M', label: 'Quattro Formaggi', price: 12 },
    ],
  },
  {
    id: 'order-4', customerId: 'bob', status: 'delivered', createdAt: new Date('2026-11-02T18:45:00Z'),
    brandId: 'da-michele', total: 21.5,
    lines: [
      { pizza: 'Margherita', size: 'XL', label: 'Margherita', price: 14 },
      { base: 'tomato', size: 'M', ingredients: ['mozzarella', 'champignons'], label: 'Pizza personnalisée', price: 7.5 },
    ],
  },
  {
    id: 'order-5', customerId: 'bob', status: 'pending', createdAt: new Date('2026-11-06T11:00:00Z'),
    brandId: 'rossopomodoro', total: 15.6,
    lines: [{ pizza: 'Supreme', size: 'L', label: 'Supreme', price: 15.6 }],
  },
] as const;

/** Mot de passe commun aux clients de démo. */
const PASSWORD = 'password123';

const main = async () => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      create: { ...customer, passwordHash },
      update: { name: customer.name, passwordHash },
    });
  }
  for (const order of orders) {
    const data = { ...order, lines: order.lines.map((line) => ({ ...line })) };
    await prisma.order.upsert({ where: { id: order.id }, create: data, update: data });
  }
  console.log(`${customers.length} clients et ${orders.length} commandes insérés`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
