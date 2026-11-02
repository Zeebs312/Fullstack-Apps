/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `LearningEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `LearningEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LearningEntry" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LearningEntry_slug_key" ON "LearningEntry"("slug");
