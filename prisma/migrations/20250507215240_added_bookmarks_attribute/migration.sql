-- CreateTable
CREATE TABLE "_Bookmarks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Bookmarks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Bookmarks_B_index" ON "_Bookmarks"("B");

-- AddForeignKey
ALTER TABLE "_Bookmarks" ADD CONSTRAINT "_Bookmarks_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Bookmarks" ADD CONSTRAINT "_Bookmarks_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
