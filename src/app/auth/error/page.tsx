"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTraduction } from "@/lib/i18n/client";

export default function AuthErrorPage() {
  const { t } = useTraduction();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Chaque message dit quoi faire ensuite : « erreur de configuration » seul
  // laisse l'utilisateur devant une impasse.
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return t.auth.accesRefuse;
      case "Configuration":
        return t.auth.erreurConfiguration;
      case "Verification":
        return t.auth.erreurVerification;
      default:
        return t.auth.erreurGenerique;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div aria-hidden="true" className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">
              {t.auth.erreurTitre}
            </h1>
            <p className="text-muted-foreground text-pretty">
              {getErrorMessage(error)}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft aria-hidden="true" className="w-4 h-4" />
              {t.auth.retourConnexion}
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-border hover:bg-accent text-foreground font-medium py-3 px-4 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t.auth.retourAccueil}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
