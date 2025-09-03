import { NextResponse } from "next/server";
import { createCanvas } from "canvas";

export async function GET() {
  try {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Arrière-plan dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Titre principal
    ctx.font = "48px Arial, sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Test Image Canvas", width / 2, 100);

    // Sous-titre
    ctx.font = "24px Arial, sans-serif";
    ctx.fillText("Cette image est générée avec node-canvas", width / 2, 150);

    // Texte avec accents
    ctx.font = "18px Arial, sans-serif";
    ctx.fillText("Texte avec accents : é è à ç ù", width / 2, 200);

    // Emojis
    ctx.fillText("Emojis : 🎌 🍜 🎭 ⚡", width / 2, 240);

    // Informations techniques
    ctx.font = "16px Arial, sans-serif";
    ctx.fillStyle = "#e0e0e0";
    ctx.fillText(`Dimensions: ${width}x${height}`, width / 2, 300);
    ctx.fillText("Méthode: node-canvas", width / 2, 330);

    // Convertir en buffer
    const buffer = canvas.toBuffer("image/png");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération de l'image canvas:", error);
    return new NextResponse("Erreur lors de la génération de l'image", {
      status: 500,
    });
  }
}
