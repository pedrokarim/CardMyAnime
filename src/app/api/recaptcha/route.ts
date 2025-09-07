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

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Validation reCAPTCHA échouée",
          details: data["error-codes"],
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
