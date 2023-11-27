/*
  Warnings:

  - You are about to drop the column `description` on the `NicovideoVideo` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `NicovideoVideo` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `NicovideoVideo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NicovideoVideo" DROP COLUMN "description",
DROP COLUMN "tags",
DROP COLUMN "title";
