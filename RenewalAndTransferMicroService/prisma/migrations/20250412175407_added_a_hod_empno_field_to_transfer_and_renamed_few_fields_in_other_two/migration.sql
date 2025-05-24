/*
  Warnings:

  - You are about to drop the column `aprvd_by_hod` on the `IpRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `aprvl_date` on the `IpRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_drm` on the `IpRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `rnwd_by_netops` on the `IpRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `rnwl_date` on the `IpRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `rqst_date` on the `IpRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `aprvd_by_hod` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `aprvl_date` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_drm` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `hod_aprvd` on the `VaptRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `rqst_date` on the `VaptRenewal` table. All the data in the column will be lost.
  - Added the required column `hod_empno_approver` to the `IpRenewal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hod_empno` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `drm_empno_initiator` to the `VaptRenewal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hod_empno_approver` to the `VaptRenewal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IpRenewal" DROP COLUMN "aprvd_by_hod",
DROP COLUMN "aprvl_date",
DROP COLUMN "created_by_drm",
DROP COLUMN "rnwd_by_netops",
DROP COLUMN "rnwl_date",
DROP COLUMN "rqst_date",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "drm_empno_initiator" BIGINT,
ADD COLUMN     "hod_empno_approver" BIGINT NOT NULL,
ADD COLUMN     "netops_empno_renewer" BIGINT,
ADD COLUMN     "renewed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "hod_empno" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "VaptRenewal" DROP COLUMN "aprvd_by_hod",
DROP COLUMN "aprvl_date",
DROP COLUMN "created_by_drm",
DROP COLUMN "hod_aprvd",
DROP COLUMN "rqst_date",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "drm_empno_initiator" BIGINT NOT NULL,
ADD COLUMN     "hod_empno_approver" BIGINT NOT NULL,
ADD COLUMN     "is_aprvd" BOOLEAN;
