-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailCode" TEXT,
ADD COLUMN     "emailCodeSentAt" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
