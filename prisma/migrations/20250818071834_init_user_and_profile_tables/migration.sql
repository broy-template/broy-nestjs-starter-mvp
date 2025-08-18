/*
  Warnings:

  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hashedRefreshToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashed_refresh_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "hashedRefreshToken",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hashed_refresh_token" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "phone_number" TEXT,
    "birth_date" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_phone_number_key" ON "public"."user_profiles"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "public"."user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_hashed_refresh_token_key" ON "public"."users"("hashed_refresh_token");

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
