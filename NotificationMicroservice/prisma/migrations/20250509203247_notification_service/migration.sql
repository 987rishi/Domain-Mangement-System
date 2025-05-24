/*
  Warnings:

  - You are about to drop the column `user_emp_no` on the `Notification` table. All the data in the column will be lost.
  - The `event_type` column on the `Notification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `recipient_emp_no` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('DOMAIN_APPLICATION_SUBMITTED', 'DOMAIN_ARM_VERIFICATION_FORWARDED', 'DOMAIN_HOD_VERIFIED', 'DOMAIN_ED_APPROVED', 'DOMAIN_NETOPS_VERIFIED', 'DOMAIN_WEBMASTER_VERIFIED', 'DOMAIN_HPC_HOD_RECOMMENDED', 'DOMAIN_VERIFICATION_COMPLETED', 'DOMAIN_VERIFICATION_REJECTED', 'DOMAIN_PURCHASED', 'DOMAIN_RENEWAL_REQUESTED', 'DOMAIN_RENEWAL_APPROVED', 'DOMAIN_RENEWAL_COMPLETED', 'DOMAIN_EXPIRY_WARNING', 'DOMAIN_EXPIRED', 'DOMAIN_DELETED', 'DOMAIN_ACTIVATED', 'DOMAIN_DEACTIVATED', 'IP_ASSIGNED', 'IP_RENEWED', 'IP_EXPIRY_WARNING', 'VAPT_COMPLETED', 'VAPT_RENEWED', 'VAPT_EXPIRY_WARNING', 'PROJECT_ASSIGNED', 'DOMAIN_TRANSFER_STARTED', 'DOMAIN_TRANSFER_APPROVED', 'DOMAIN_TRANSFER_FINISHED', 'USER_ENABLED', 'USER_DISABLED', 'SYSTEM_ALERT', 'UNKNOWN_EVENT');

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_emp_no_fkey";

-- DropIndex
DROP INDEX "Notification_created_at_idx";

-- DropIndex
DROP INDEX "Notification_user_emp_no_is_read_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "user_emp_no",
ADD COLUMN     "read_at" TIMESTAMP(3),
ADD COLUMN     "recipient_emp_no" BIGINT NOT NULL,
ADD COLUMN     "related_entity_id" BIGINT,
ADD COLUMN     "related_entity_type" TEXT,
ADD COLUMN     "triggered_by_emp_no" BIGINT,
ADD COLUMN     "triggered_by_role" TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "event_type",
ADD COLUMN     "event_type" "WebhookEventType";

-- DropTable
DROP TABLE "User";

-- CreateIndex
CREATE INDEX "Notification_recipient_emp_no_is_read_created_at_idx" ON "Notification"("recipient_emp_no", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "Notification_event_type_idx" ON "Notification"("event_type");

-- CreateIndex
CREATE INDEX "Notification_related_entity_id_related_entity_type_idx" ON "Notification"("related_entity_id", "related_entity_type");
