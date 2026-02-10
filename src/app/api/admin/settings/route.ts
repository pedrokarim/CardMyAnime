import { NextRequest, NextResponse } from "next/server";
import { appSettings } from "@/lib/services/appSettings";

export async function GET() {
  try {
    const settings = await appSettings.getAll();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await appSettings.setMany(body);
    return NextResponse.json({
      success: true,
      message: "Paramètres sauvegardés avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
