# Étape de build - Node 22 (sans Bun)
FROM node:22-slim AS builder

# Installer les dépendances système nécessaires pour canvas, sharp et node-gyp
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libpixman-1-dev \
    libfreetype-dev \
    libfontconfig-dev \
    fonts-dejavu \
    fonts-liberation \
    fonts-noto \
    curl \
    wget \
    libvips-dev \
    libglib2.0-dev \
    libexpat-dev \
    libpng-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./
COPY prisma.config.ts ./
# bun.lock n'est pas nécessaire pour npm dans l'étape builder

# Copie le schéma Prisma pour le postinstall
COPY prisma/ ./prisma/

# Installe les dépendances (dev incluses pour build)
# Utilise --legacy-peer-deps pour résoudre le conflit entre Next.js 15 et @auth/nextjs
RUN npm install --legacy-peer-deps

# Copie le reste du code source
COPY . .

# Copie le fichier .env pour le build (si il existe)
COPY .env* ./

# Le client Prisma est généré automatiquement par le postinstall dans package.json

# Build de l'application
RUN npm run build

# Étape de production - Node 22
FROM node:22-slim AS runner

# Installer les dépendances runtime nécessaires pour canvas + outils système
RUN apt-get update && apt-get install -y \
    adduser \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    libpixman-1-0 \
    libfreetype6 \
    libfontconfig1 \
    fonts-dejavu \
    fonts-liberation \
    fonts-noto \
    && rm -rf /var/lib/apt/lists/*

# Crée un utilisateur non-root pour la sécurité avec un répertoire home
RUN addgroup --system --gid 1001 nodegrp \
  && adduser --system --uid 1001 --home /home/nextjs --ingroup nodegrp nextjs \
  && mkdir -p /home/nextjs && chown -R nextjs:nodegrp /home/nextjs

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
# bun.lock n'est pas nécessaire pour npm
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/prisma ./prisma

# Copie les polices personnalisées
COPY --from=builder /app/public/fonts ./public/fonts

# Copie les scripts cron (snapshot, enrichissement)
COPY --from=builder --chown=nextjs:nodegrp /app/scripts ./scripts

# Copie les fichiers de build
COPY --from=builder --chown=nextjs:nodegrp /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodegrp /app/.next/static ./.next/static

# Copie les node_modules depuis le builder (toutes les dépendances déjà résolues)
RUN mkdir -p /app/node_modules /app/.npm
COPY --from=builder --chown=nextjs:nodegrp /app/node_modules ./node_modules

# Crée le dossier logs avec les bons droits (point de montage du volume)
RUN mkdir -p /app/logs && chown -R nextjs:nodegrp /app/logs

# Change vers l'utilisateur non-root
USER nextjs

# Expose le port (sera configuré via variable d'environnement)
EXPOSE ${PORT:-3000}

# Variables d'environnement par défaut
ENV PORT=${PORT:-3000}
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
# Configure npm pour utiliser un cache dans /app au lieu de /nonexistent
ENV NPM_CONFIG_CACHE=/app/.npm
ENV HOME=/home/nextjs

# Script de démarrage avec initialisation de la DB
# Utilise le binaire Prisma directement pour éviter les problèmes npm
CMD ./node_modules/.bin/prisma db push && node server.js