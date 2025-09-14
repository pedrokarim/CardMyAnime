import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

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
        body: `secret=${secretKey}&response=${token}${
          action ? `&action=${action}` : ""
        }`,
      }
    );

    const data = await response.json();

    // Log pour le débogage
    console.log("reCAPTCHA v3 validation response:", {
      success: data.success,
      score: data.score,
      action: data.action,
      errorCodes: data["error-codes"],
      hostname: data.hostname,
    });

    if (data.success) {
      // reCAPTCHA v3 retourne un score de 0.0 à 1.0
      const score = data.score || 0;
      const minScore = 0.5; // Score minimum acceptable

      if (score < minScore) {
        return NextResponse.json(
          {
            success: false,
            error: "Score reCAPTCHA trop faible",
            details: { score, minScore },
          },
          { status: 400 }
        );
      }

      // Vérifier l'action si fournie
      if (action && data.action !== action) {
        return NextResponse.json(
          {
            success: false,
            error: "Action reCAPTCHA invalide",
            details: { expected: action, received: data.action },
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        score: data.score,
        action: data.action,
      });
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
                  action,
                }
              : undefined,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la validation reCAPTCHA v3:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
