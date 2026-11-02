/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `LearningEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LearningEntry" DROP COLUMN "imageUrl",
ADD COLUMN     "descriptions" TEXT[],
ADD COLUMN     "imageUrls" TEXT[];
