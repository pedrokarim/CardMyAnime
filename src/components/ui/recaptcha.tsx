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

  const handleExpired = () => {
    if (onExpired) {
      onExpired();
    }
  };

  const handleError = () => {
    if (onError) {
      onError();
    }
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
        onChange={onChange}
        onExpired={handleExpired}
        onError={handleError}
        theme="dark"
        size="normal"
      />
    </div>
  );
}
