import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface DataDeletionRequest {
  platform: string;
  username: string;
  email: string;
  reason: string;
  additionalInfo?: string;
  recaptchaToken: string;
  recaptchaAction?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DataDeletionRequest = await request.json();
    const {
      platform,
      username,
      email,
      reason,
      additionalInfo,
      recaptchaToken,
      recaptchaAction,
    } = body;

    // Validation des champs requis
    if (!platform || !username || !email || !reason || !recaptchaToken) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Vérifier le reCAPTCHA
    const recaptchaResponse = await fetch(
      `${request.nextUrl.origin}/api/recaptcha`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: recaptchaToken,
          action: recaptchaAction || "data_deletion",
        }),
      }
    );

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return NextResponse.json(
        { success: false, error: "Validation reCAPTCHA échouée" },
        { status: 400 }
      );
    }

    // Générer un ID unique pour la demande
    const requestId = `DEL-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Récupérer les informations de la requête
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Sauvegarder la demande en base de données
    const deletionRequest = await prisma.dataDeletionRequest.create({
      data: {
        platform,
        username,
        email,
        reason,
        additionalInfo,
        requestId,
        ipAddress,
        userAgent,
        status: "pending",
      },
    });

    console.log("Demande de suppression sauvegardée:", {
      id: deletionRequest.id,
      requestId,
      platform,
      username,
      email,
      reason,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implémenter la logique de suppression réelle
    // - Supprimer les données du cache
    // - Supprimer les cartes générées
    // - Envoyer un email de confirmation

    return NextResponse.json({
      success: true,
      message: "Demande de suppression reçue avec succès",
      requestId,
    });
  } catch (error) {
    console.error("Erreur lors du traitement de la demande:", error);
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
