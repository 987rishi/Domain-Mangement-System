-- CreateTable
CREATE TABLE "User" (
    "emp_no" BIGSERIAL NOT NULL,
    "usr_email" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "usr_fname" VARCHAR(255) NOT NULL,
    "usr_lname" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("emp_no")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" BIGSERIAL NOT NULL,
    "user_emp_no" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" VARCHAR(50),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_usr_email_key" ON "User"("usr_email");

-- CreateIndex
CREATE INDEX "Notification_user_emp_no_is_read_idx" ON "Notification"("user_emp_no", "is_read");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_emp_no_fkey" FOREIGN KEY ("user_emp_no") REFERENCES "User"("emp_no") ON DELETE RESTRICT ON UPDATE CASCADE;
