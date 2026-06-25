/*
  Warnings:

  - You are about to drop the column `delivery_address` on the `orders` table. All the data in the column will be lost.
  - Made the column `size` on table `order_items` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `city` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street_address` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "size" SET NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "delivery_address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "street_address" TEXT NOT NULL,
ADD COLUMN     "zip_code" TEXT;
