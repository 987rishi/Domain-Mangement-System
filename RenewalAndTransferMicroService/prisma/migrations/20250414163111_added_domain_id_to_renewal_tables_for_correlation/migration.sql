/*
  Warnings:

  - Added the required column `dm_id` to the `IpRenewal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dm_id` to the `VaptRenewal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IpRenewal" ADD COLUMN     "dm_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "VaptRenewal" ADD COLUMN     "dm_id" BIGINT NOT NULL;
