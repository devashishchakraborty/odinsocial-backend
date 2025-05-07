-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentPostId" INTEGER,
ALTER COLUMN "published" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "imageUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
