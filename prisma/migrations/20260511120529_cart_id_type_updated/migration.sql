/*
  Warnings:

  - The primary key for the `carts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cartId_fkey";

-- AlterTable
ALTER TABLE "cart_items" ALTER COLUMN "cartId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "carts" DROP CONSTRAINT "carts_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "carts_id_seq";

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
