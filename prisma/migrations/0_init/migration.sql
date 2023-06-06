-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('administrate');

-- CreateEnum
CREATE TYPE "SessionTokenType" AS ENUM ('cookie');

-- CreateEnum
CREATE TYPE "OpenIdProvider" AS ENUM ('google', 'facebook', 'twitter', 'github', 'discord', 'twitch', 'gitlab', 'bitbucket');

-- CreateTable
CREATE TABLE "role" (
    "roleName" TEXT NOT NULL,
    "description" TEXT,
    "permissions" "Permission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "role_pkey" PRIMARY KEY ("roleName")
);

-- CreateTable
CREATE TABLE "user" (
    "userId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "language" TEXT,
    "timezone" TEXT,
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "emailVerificationCode" TEXT,
    "phoneVerificationCode" TEXT,
    "oneTimeLoginCodes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "userRole" (
    "userId" UUID NOT NULL,
    "roleName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "userRole_pkey" PRIMARY KEY ("userId","roleName")
);

-- CreateTable
CREATE TABLE "session" (
    "sessionId" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "SessionTokenType" NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "session_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "openIdAccount" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "provider" "OpenIdProvider" NOT NULL,
    "accountId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "username" TEXT,
    "fullName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "openIdAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_value_key" ON "session"("value");

-- AddForeignKey
ALTER TABLE "userRole" ADD CONSTRAINT "userRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userRole" ADD CONSTRAINT "userRole_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "role"("roleName") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "openIdAccount" ADD CONSTRAINT "openIdAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

