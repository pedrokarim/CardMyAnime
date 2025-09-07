"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "@/components/ui/loading";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Afficher le loading pendant la vérification d'authentification
  if (status === "loading") {
    return <PageLoading message="Vérification de l'authentification..." />;
  }

  // Si pas de session, ne rien afficher (redirection en cours)
  if (!session) {
    return null;
  }

  // Si authentifié, afficher le contenu
  return <>{children}</>;
}
