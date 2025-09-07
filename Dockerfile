# Étape de build - Utilise Bun pour une installation plus rapide
FROM oven/bun:1-alpine AS builder

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./
COPY bun.lock ./

# Installe les dépendances avec Bun (plus rapide que npm)
RUN bun install --frozen-lockfile

# Copie le code source
COPY . .

# Copie le fichier .env pour le build (si il existe)
COPY .env* ./

# Générer le client Prisma
RUN bunx prisma generate

# Build de l'application
RUN bun run build

# Étape de production - Utilise Bun pour l'exécution
FROM oven/bun:1-alpine AS runner

# Crée un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 nextjs

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bun.lock ./

# Copie les fichiers de build
COPY --from=builder --chown=nextjs:bunjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bunjs /app/.next/static ./.next/static

# Copie le client Prisma généré
COPY --from=builder --chown=nextjs:bunjs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:bunjs /app/node_modules/@prisma ./node_modules/@prisma

# Copie le schema Prisma
COPY --from=builder --chown=nextjs:bunjs /app/prisma ./prisma

# Change vers l'utilisateur non-root
USER nextjs

# Expose le port (sera configuré via variable d'environnement)
EXPOSE ${PORT:-3000}

# Variables d'environnement par défaut
ENV PORT=${PORT:-3000}
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Script de démarrage avec initialisation de la DB
CMD bunx prisma db push && bun server.js 