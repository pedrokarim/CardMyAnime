import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { appSettings } from "@/lib/services/appSettings";

const unauthorized = () =>
  NextResponse.json({ error: "Non autorisé" }, { status: 401 });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

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
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

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
