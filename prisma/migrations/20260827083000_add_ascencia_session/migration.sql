-- CreateTable
CREATE TABLE "AscenciaSession" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claims" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AscenciaSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AscenciaSession_expiresAt_idx" ON "AscenciaSession"("expiresAt");
