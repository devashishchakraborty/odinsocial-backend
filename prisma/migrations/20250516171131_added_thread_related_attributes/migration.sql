-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "RootPostId" INTEGER,
ADD COLUMN     "isThread" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_parentPostId_idx" ON "Post"("parentPostId");

-- CreateIndex
CREATE INDEX "Post_RootPostId_idx" ON "Post"("RootPostId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_RootPostId_fkey" FOREIGN KEY ("RootPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
