"use client";

import { useEffect, useRef } from "react";
import { useTraduction } from "@/lib/i18n/client";

interface ReCAPTCHAProps {
  onChange: (token: string | null) => void;
  onError?: () => void;
  className?: string;
  action?: string;
}

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

export function ReCAPTCHAComponent({
  onChange,
  onError,
  className = "",
  action = "data_deletion",
}: ReCAPTCHAProps) {
  const { t } = useTraduction();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isLoaded = useRef(false);

  useEffect(() => {
    if (!siteKey) {
      console.error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY non définie");
      if (onError) onError();
      return;
    }

    // Charger le script reCAPTCHA v3
    if (!isLoaded.current) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        isLoaded.current = true;
        executeRecaptcha();
      };
      script.onerror = () => {
        console.error("Erreur lors du chargement de reCAPTCHA v3");
        if (onError) onError();
      };
      document.head.appendChild(script);
    } else {
      executeRecaptcha();
    }

    function executeRecaptcha() {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey!, { action })
            .then((token) => {
              onChange(token);
            })
            .catch((error) => {
              console.error("Erreur lors de l'exécution reCAPTCHA v3:", error);
              if (onError) onError();
            });
        });
      }
    }
  }, [siteKey, action, onChange, onError]);

  // Vérifier que la clé de site est présente
  if (!siteKey) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {t.suppression.recaptchaAbsent}
          </p>
        </div>
      </div>
    );
  }

  // reCAPTCHA v3 est invisible, on affiche juste un indicateur
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {t.suppression.recaptchaActif}
        </p>
      </div>
    </div>
  );
}
