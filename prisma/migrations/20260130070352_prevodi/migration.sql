/*
  Warnings:

  - Added the required column `opis` to the `Soba` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opis_en` to the `Soba` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tip_en` to the `Soba` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Soba" ADD COLUMN     "opis" TEXT NOT NULL,
ADD COLUMN     "opis_en" TEXT NOT NULL,
ADD COLUMN     "slike" TEXT,
ADD COLUMN     "tip_en" TEXT NOT NULL;
