"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { ascenciaWidgetProps } from "@/lib/ascencia/widget";
import { useTraduction } from "@/lib/i18n/client";

const SESSION_ATTEMPTS = 60;
const SESSION_RETRY_DELAY_MS = 250;

export default function AuthCallbackPage() {
  const { t } = useTraduction();
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isWidgetReady) return;

    let cancelled = false;
    const waitForSession = async () => {
      for (let attempt = 0; attempt < SESSION_ATTEMPTS; attempt += 1) {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
          cache: "no-store",
        }).catch(() => null);
        const body = response?.ok
          ? ((await response.json()) as { authenticated?: boolean })
          : null;

        if (body?.authenticated) {
          if (!cancelled) router.replace("/admin");
          return;
        }

        await new Promise((resolve) =>
          window.setTimeout(resolve, SESSION_RETRY_DELAY_MS),
        );
      }

      if (!cancelled) setError(t.auth.erreurVerification);
    };

    void waitForSession();
    return () => {
      cancelled = true;
    };
  }, [isWidgetReady, router, t.auth.erreurVerification]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Script
        {...ascenciaWidgetProps}
        strategy="afterInteractive"
        onReady={() => setIsWidgetReady(true)}
        onError={() => setError(t.auth.erreurChargementWidget)}
      />

      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 text-center">
        {!error && (
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto mb-4 h-8 w-8 animate-spin text-primary"
          />
        )}
        <h1 className="text-xl font-semibold text-foreground">
          {error ? t.auth.erreurTitre : t.auth.verificationConnexion}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          {error ?? t.auth.verificationConnexionDetail}
        </p>
      </div>
    </main>
  );
}
