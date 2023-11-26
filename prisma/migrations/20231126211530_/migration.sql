-- CreateTable
CREATE TABLE "NicovideoVideo" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NicovideoVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NicovideoVideo_sourceId_key" ON "NicovideoVideo"("sourceId");
