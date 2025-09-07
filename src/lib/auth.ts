import { PrismaAdapter } from "@auth/prisma-adapter";
import Discord from "next-auth/providers/discord";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import { prisma } from "./prisma";

// Récupérer la liste des utilisateurs autorisés depuis les variables d'environnement
const AUTHORIZED_USERS =
  process.env.AUTHORIZED_USERS?.split(",")
    .map((id) => id.trim())
    .filter(Boolean) || [];

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Permettre tous les hôtes (pour le déploiement)
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Vérifier si l'utilisateur Discord est autorisé
      if (account?.provider === "discord" && profile?.id) {
        const isAuthorized = AUTHORIZED_USERS.includes(profile.id as string);

        if (!isAuthorized) {
          console.log(
            `🔒 Tentative de connexion non autorisée: ${profile.id} (${user.name})`
          );
          return false; // Refuser la connexion
        }

        console.log(`✅ Connexion autorisée: ${profile.id} (${user.name})`);
        return true;
      }

      return false; // Refuser les autres providers
    },
    async jwt({ token, user, account, profile }: any) {
      // Ajouter l'ID utilisateur au token lors de la première connexion
      if (account?.provider === "discord" && profile?.id) {
        token.id = profile.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Ajouter l'ID utilisateur à la session depuis le token
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
  },
};

export const { auth, handlers } = NextAuth(authConfig);
