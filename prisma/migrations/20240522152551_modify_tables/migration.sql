/*
  Warnings:

  - You are about to drop the column `isUnwanted` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "isUnwanted";

-- DropTable
DROP TABLE "Category";
