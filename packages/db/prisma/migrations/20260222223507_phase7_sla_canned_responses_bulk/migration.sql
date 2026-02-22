-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "autoAssign" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "firstResponseAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "canned_responses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "shortcut" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canned_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canned_responses_orgId_idx" ON "canned_responses"("orgId");

-- CreateIndex
CREATE INDEX "canned_responses_orgId_category_idx" ON "canned_responses"("orgId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "canned_responses_orgId_shortcut_key" ON "canned_responses"("orgId", "shortcut");

-- AddForeignKey
ALTER TABLE "canned_responses" ADD CONSTRAINT "canned_responses_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
