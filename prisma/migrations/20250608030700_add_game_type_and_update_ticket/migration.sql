/*
  Warnings:

  - You are about to drop the column `endTime` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `type` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metamaskId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('MINI', 'STANDARD', 'MEGA');

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "type" "GameType" NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "userId",
ADD COLUMN     "metamaskId" TEXT NOT NULL;
