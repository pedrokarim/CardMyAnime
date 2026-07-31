-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "CardGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "views24h" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDataCache" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDataCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewLog" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDeletionRequest" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "additionalInfo" TEXT,
    "requestId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendSnapshot" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "views24h" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "lastOutput" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CronJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCache" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "anilistId" INTEGER,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "status" TEXT,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshAfter" TIMESTAMP(3),

    CONSTRAINT "MediaCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_expires_idx" ON "VerificationToken"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "CardGeneration_userId_idx" ON "CardGeneration"("userId");

-- CreateIndex
CREATE INDEX "CardGeneration_platform_username_idx" ON "CardGeneration"("platform", "username");

-- CreateIndex
CREATE INDEX "CardGeneration_createdAt_idx" ON "CardGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "CardGeneration_views_idx" ON "CardGeneration"("views");

-- CreateIndex
CREATE INDEX "CardGeneration_views24h_idx" ON "CardGeneration"("views24h");

-- CreateIndex
CREATE UNIQUE INDEX "CardGeneration_platform_username_cardType_key" ON "CardGeneration"("platform", "username", "cardType");

-- CreateIndex
CREATE INDEX "UserDataCache_expiresAt_idx" ON "UserDataCache"("expiresAt");

-- CreateIndex
CREATE INDEX "UserDataCache_platform_username_idx" ON "UserDataCache"("platform", "username");

-- CreateIndex
CREATE INDEX "UserDataCache_lastFetched_idx" ON "UserDataCache"("lastFetched");

-- CreateIndex
CREATE UNIQUE INDEX "UserDataCache_platform_username_key" ON "UserDataCache"("platform", "username");

-- CreateIndex
CREATE INDEX "ViewLog_expiresAt_idx" ON "ViewLog"("expiresAt");

-- CreateIndex
CREATE INDEX "ViewLog_cardId_idx" ON "ViewLog"("cardId");

-- CreateIndex
CREATE INDEX "ViewLog_createdAt_idx" ON "ViewLog"("createdAt");

-- CreateIndex
CREATE INDEX "ViewLog_ip_idx" ON "ViewLog"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "ViewLog_cardId_fingerprint_key" ON "ViewLog"("cardId", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "DataDeletionRequest_requestId_key" ON "DataDeletionRequest"("requestId");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_status_idx" ON "DataDeletionRequest"("status");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_platform_username_idx" ON "DataDeletionRequest"("platform", "username");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_email_idx" ON "DataDeletionRequest"("email");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_createdAt_idx" ON "DataDeletionRequest"("createdAt");

-- CreateIndex
CREATE INDEX "DataDeletionRequest_requestId_idx" ON "DataDeletionRequest"("requestId");

-- CreateIndex
CREATE INDEX "TrendSnapshot_cardId_idx" ON "TrendSnapshot"("cardId");

-- CreateIndex
CREATE INDEX "TrendSnapshot_platform_username_idx" ON "TrendSnapshot"("platform", "username");

-- CreateIndex
CREATE INDEX "TrendSnapshot_createdAt_idx" ON "TrendSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "TrendSnapshot_cardId_createdAt_idx" ON "TrendSnapshot"("cardId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_key_key" ON "AppSettings"("key");

-- CreateIndex
CREATE INDEX "AppSettings_key_idx" ON "AppSettings"("key");

-- CreateIndex
CREATE INDEX "CronJob_enabled_idx" ON "CronJob"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "MediaCache_title_key" ON "MediaCache"("title");

-- CreateIndex
CREATE INDEX "MediaCache_refreshAfter_idx" ON "MediaCache"("refreshAfter");

-- CreateIndex
CREATE INDEX "MediaCache_type_idx" ON "MediaCache"("type");

-- CreateIndex
CREATE INDEX "MediaCache_status_idx" ON "MediaCache"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardGeneration" ADD CONSTRAINT "CardGeneration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

