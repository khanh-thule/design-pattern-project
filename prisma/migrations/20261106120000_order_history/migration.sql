-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'delivered', 'cancelled');

CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");

