"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useAscenciaSession } from "@/lib/ascencia/client";
import { ascenciaWidgetProps } from "@/lib/ascencia/widget";
import { SITE_CONFIG } from "@/lib/constants";
import { useTraduction } from "@/lib/i18n/client";

export default function SignInPage() {
  const { t } = useTraduction();
  const { status, refresh } = useAscenciaSession();
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/admin");
  }, [router, status]);

  useEffect(() => {
    if (!isWidgetReady || !window.AscenciaID) return;

    const unsubscribeSignIn = window.AscenciaID.on("signin", () => {
      void refresh().then(() => router.replace("/admin"));
    });
    const unsubscribeError = window.AscenciaID.on("error", () => {
      setError(t.auth.erreurConnexion);
    });

    return () => {
      unsubscribeSignIn();
      unsubscribeError();
    };
  }, [isWidgetReady, refresh, router, t.auth.erreurConnexion]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Script
        {...ascenciaWidgetProps}
        strategy="afterInteractive"
        onReady={() => setIsWidgetReady(true)}
        onError={() => setError(t.auth.erreurChargementWidget)}
      />

      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
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
            type="button"
            data-ascencia-login=""
            disabled={!isWidgetReady}
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ShieldCheck aria-hidden="true" className="w-5 h-5" />
            {isWidgetReady ? t.auth.connexionAscencia : t.auth.chargementWidget}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">{t.auth.noteAcces}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
