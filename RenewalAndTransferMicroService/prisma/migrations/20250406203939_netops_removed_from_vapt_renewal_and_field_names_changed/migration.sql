/*
  Warnings:

  - The values [RENEWED_BY_NETOPS] on the enum `VaptRenewalRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `aprvl_pdf` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `is_aprvd` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `is_rnwd` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `netops_remarks` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `rnwd_by_netops` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `rnwl_date` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `rnwl_pdf` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `vapt_expiry_date` on the `VaptRenewal` table. All the data in the column will be lost.
  - Added the required column `new_vapt_report` to the `VaptRenewal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VaptRenewalRequestStatus_new" AS ENUM ('PENDING_APPROVAL', 'APPROVED_BY_HOD', 'REJECTED_BY_HOD');
ALTER TABLE "VaptRenewal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "VaptRenewal" ALTER COLUMN "status" TYPE "VaptRenewalRequestStatus_new" USING ("status"::text::"VaptRenewalRequestStatus_new");
ALTER TYPE "VaptRenewalRequestStatus" RENAME TO "VaptRenewalRequestStatus_old";
ALTER TYPE "VaptRenewalRequestStatus_new" RENAME TO "VaptRenewalRequestStatus";
DROP TYPE "VaptRenewalRequestStatus_old";
ALTER TABLE "VaptRenewal" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';
COMMIT;

-- AlterTable
ALTER TABLE "VaptRenewal" DROP COLUMN "aprvl_pdf",
DROP COLUMN "is_aprvd",
DROP COLUMN "is_rnwd",
DROP COLUMN "netops_remarks",
DROP COLUMN "rnwd_by_netops",
DROP COLUMN "rnwl_date",
DROP COLUMN "rnwl_pdf",
DROP COLUMN "vapt_expiry_date",
ADD COLUMN     "hod_aprvd" BOOLEAN,
ADD COLUMN     "new_vapt_expiry_date" TIMESTAMP(3),
ADD COLUMN     "new_vapt_report" BYTEA NOT NULL,
ADD COLUMN     "old_vapt_report" BYTEA,
ALTER COLUMN "rqst_date" SET DEFAULT CURRENT_TIMESTAMP;
