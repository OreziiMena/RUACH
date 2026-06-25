/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,size]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - Made the column `size` on table `cart_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "cart_items_cartId_productId_key";

-- AlterTable
ALTER TABLE "cart_items" ALTER COLUMN "size" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_productId_size_key" ON "cart_items"("cartId", "productId", "size");
