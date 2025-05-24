-- CreateEnum
CREATE TYPE "IpRenewalRequestStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED_BY_HOD', 'REJECTED_BY_HOD', 'RENEWED_BY_NETOPS');

-- CreateEnum
CREATE TYPE "VaptRenewalRequestStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED_BY_HOD', 'REJECTED_BY_HOD', 'RENEWED_BY_NETOPS');

-- CreateTable
CREATE TABLE "Transfer" (
    "tt_id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dm_id" BIGINT NOT NULL,
    "trns_frm" BIGINT NOT NULL,
    "trns_to" BIGINT NOT NULL,
    "rsn_for_trns" TEXT NOT NULL,
    "prf_upload" BYTEA NOT NULL,
    "hod_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("tt_id")
);

-- CreateTable
CREATE TABLE "IpRenewal" (
    "ip_rnwl_id" BIGSERIAL NOT NULL,
    "ip_id" BIGINT NOT NULL,
    "prev_ip_addrs" TEXT NOT NULL,
    "aprvl_pdf" BYTEA NOT NULL,
    "rnwl_no" BIGINT NOT NULL,
    "rqst_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_drm" BIGINT,
    "drm_remarks" TEXT NOT NULL DEFAULT 'NA',
    "aprvd_by_hod" BIGINT,
    "is_aprvd" BOOLEAN,
    "aprvl_date" TIMESTAMP(3),
    "hod_remarks" TEXT DEFAULT 'NA',
    "rnwd_by_netops" BIGINT,
    "new_ip_addrs" TEXT,
    "ip_expiry_date" TIMESTAMP(3),
    "is_rnwd" BOOLEAN NOT NULL DEFAULT false,
    "rnwl_date" TIMESTAMP(3),
    "netops_remarks" TEXT NOT NULL DEFAULT 'NA',
    "rnwl_pdf" BYTEA,
    "status" "IpRenewalRequestStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpRenewal_pkey" PRIMARY KEY ("ip_rnwl_id")
);

-- CreateTable
CREATE TABLE "VaptRenewal" (
    "vapt_rnwl_id" BIGSERIAL NOT NULL,
    "vapt_id" BIGINT NOT NULL,
    "aprvl_pdf" BYTEA NOT NULL,
    "rnwl_no" BIGINT NOT NULL,
    "rqst_date" TIMESTAMP(3) NOT NULL,
    "created_by_drm" BIGINT,
    "drm_remarks" TEXT NOT NULL DEFAULT 'NA',
    "is_aprvd" BOOLEAN,
    "aprvd_by_hod" BIGINT,
    "aprvl_date" TIMESTAMP(3),
    "hod_remarks" TEXT NOT NULL DEFAULT 'NA',
    "is_rnwd" BOOLEAN NOT NULL DEFAULT false,
    "rnwd_by_netops" BIGINT,
    "rnwl_date" TIMESTAMP(3),
    "netops_remarks" TEXT NOT NULL DEFAULT 'NA',
    "rnwl_pdf" BYTEA,
    "vapt_expiry_date" TIMESTAMP(3),
    "status" "VaptRenewalRequestStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaptRenewal_pkey" PRIMARY KEY ("vapt_rnwl_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_tt_id_key" ON "Transfer"("tt_id");

-- CreateIndex
CREATE UNIQUE INDEX "IpRenewal_ip_rnwl_id_key" ON "IpRenewal"("ip_rnwl_id");

-- CreateIndex
CREATE UNIQUE INDEX "VaptRenewal_vapt_rnwl_id_key" ON "VaptRenewal"("vapt_rnwl_id");
