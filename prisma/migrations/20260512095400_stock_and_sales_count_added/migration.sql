/*
  Warnings:

  - Added the required column `stock_count` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sales_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stock_count" INTEGER NOT NULL;
