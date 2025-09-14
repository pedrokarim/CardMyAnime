"use client";

import { useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface ReCAPTCHAProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  className?: string;
}

export function ReCAPTCHAComponent({
  onChange,
  onExpired,
  onError,
  className = "",
}: ReCAPTCHAProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleExpired = () => {
    if (onExpired) {
      onExpired();
    }
  };

  const handleError = () => {
    console.error("Erreur reCAPTCHA côté client:", {
      siteKey: siteKey ? `${siteKey.substring(0, 8)}...` : "Non définie",
      hasSiteKey: !!siteKey,
    });
    if (onError) {
      onError();
    }
  };

  // Vérifier que la clé de site est présente
  if (!siteKey) {
    console.error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY non définie");
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            reCAPTCHA non configuré. Veuillez contacter l'administrateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={onChange}
        onExpired={handleExpired}
        onError={handleError}
        theme="dark"
        size="normal"
      />
    </div>
  );
}
