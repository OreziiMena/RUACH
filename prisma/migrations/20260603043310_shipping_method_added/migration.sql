/*
  Warnings:

  - Added the required column `shippingMethod` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShippingMethod" AS ENUM ('WITHIN_PORT_HARCOURT', 'OUTSIDE_PORT_HARCOURT_DOORS', 'OUTSIDE_PORT_HARCOURT_PICKUP');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shippingMethod" "ShippingMethod" NOT NULL;
