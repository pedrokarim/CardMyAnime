"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    getSession().then((session: any) => {
      if (session) {
        router.push("/admin");
      }
    });
  }, [router]);

  const handleDiscordSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn("discord", {
        callbackUrl: "/admin",
      });
    } catch (error) {
      setError("Erreur lors de la connexion");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Administration CardMyAnime
            </h1>
            <p className="text-muted-foreground">
              Connexion requise pour accéder aux fonctionnalités
              d'administration
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleDiscordSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {isLoading ? "Connexion..." : "Se connecter avec Discord"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Seuls les utilisateurs Discord autorisés peuvent accéder à cette
              section
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
