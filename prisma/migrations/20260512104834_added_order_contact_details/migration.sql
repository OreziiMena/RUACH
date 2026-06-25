/*
  Warnings:

  - Added the required column `contact_email` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_phone` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "contact_email" TEXT NOT NULL,
ADD COLUMN     "contact_name" TEXT NOT NULL,
ADD COLUMN     "contact_phone" TEXT NOT NULL;
