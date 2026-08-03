"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { useTraduction } from "@/lib/i18n/client";

export default function SignInPage() {
  const { t } = useTraduction();
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
      setError(t.auth.erreurConnexion);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src={SITE_CONFIG.site.logo}
                alt=""
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">
              {t.auth.titreAdmin}{" "}
              <span translate="no">{SITE_CONFIG.site.name}</span>
            </h1>
            <p className="text-muted-foreground text-pretty">
              {t.auth.sousTitreAdmin}
            </p>
          </div>

          <div aria-live="polite" className="empty:hidden">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleDiscordSignIn}
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <DiscordIcon aria-hidden="true" className="w-5 h-5" />
            {isLoading ? t.auth.connexion : t.auth.connexionDiscord}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              {t.auth.noteAcces}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
