/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "size" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_productId_key" ON "cart_items"("cartId", "productId");
