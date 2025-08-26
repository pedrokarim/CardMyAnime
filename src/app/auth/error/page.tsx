"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return "Accès refusé. Vous n'êtes pas autorisé à vous connecter.";
      case "Configuration":
        return "Erreur de configuration du serveur d'authentification.";
      case "Verification":
        return "Erreur lors de la vérification de votre compte.";
      default:
        return "Une erreur s'est produite lors de la connexion.";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Erreur de Connexion
            </h1>
            <p className="text-muted-foreground">{getErrorMessage(error)}</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-border hover:bg-accent text-foreground font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
