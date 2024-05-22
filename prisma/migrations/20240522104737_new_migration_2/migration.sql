/*
  Warnings:

  - Changed the type of `desiredAmount` on the `GoalExpense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "GoalExpense" DROP COLUMN "desiredAmount",
ADD COLUMN     "desiredAmount" DECIMAL(65,30) NOT NULL;
