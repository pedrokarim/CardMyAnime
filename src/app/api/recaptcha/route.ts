import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token reCAPTCHA manquant" },
        { status: 400 }
      );
    }

    // Vérifier le token avec Google reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY non configurée");
      return NextResponse.json(
        { success: false, error: "Configuration reCAPTCHA manquante" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    // Log pour le débogage (à retirer en production)
    console.log("reCAPTCHA validation response:", {
      success: data.success,
      errorCodes: data["error-codes"],
      challengeTs: data.challenge_ts,
      hostname: data.hostname,
    });

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      // Messages d'erreur plus détaillés
      const errorMessages = {
        "missing-input-secret": "Clé secrète reCAPTCHA manquante",
        "invalid-input-secret": "Clé secrète reCAPTCHA invalide",
        "missing-input-response": "Token reCAPTCHA manquant",
        "invalid-input-response": "Token reCAPTCHA invalide ou expiré",
        "bad-request": "Requête malformée vers reCAPTCHA",
        "invalid-keys": "Clés reCAPTCHA invalides",
        "timeout-or-duplicate": "Token reCAPTCHA expiré ou déjà utilisé",
      };

      const errorCode = data["error-codes"]?.[0];
      const errorMessage =
        errorMessages[errorCode as keyof typeof errorMessages] ||
        "Erreur de validation reCAPTCHA";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: data["error-codes"],
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  secretKeyLength: secretKey?.length || 0,
                  secretKeyPrefix: secretKey?.substring(0, 8) + "...",
                  tokenLength: token?.length || 0,
                  tokenPrefix: token?.substring(0, 20) + "...",
                }
              : undefined,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la validation reCAPTCHA:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
