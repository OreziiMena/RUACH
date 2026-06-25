/*
  Warnings:

  - You are about to drop the column `slug` on the `categories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "categories_slug_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "slug";
