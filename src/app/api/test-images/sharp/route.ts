import { NextResponse } from "next/server";
import sharp from "sharp";

export async function GET() {
  try {
    const width = 800;
    const height = 400;

    // Créer une image SVG avec du texte
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grad)"/>
        
        <text x="50%" y="100" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">
          Test Image Sharp
        </text>
        
        <text x="50%" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">
          Cette image est générée avec Sharp
        </text>
        
        <text x="50%" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18">
          Texte avec accents : é è à ç ù
        </text>
        
        <text x="50%" y="240" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18">
          Emojis : 🎌 🍜 🎭 ⚡
        </text>
        
        <text x="50%" y="300" text-anchor="middle" fill="#e0e0e0" font-family="Arial, sans-serif" font-size="16">
          Dimensions: ${width}x${height}
        </text>
        
        <text x="50%" y="330" text-anchor="middle" fill="#e0e0e0" font-family="Arial, sans-serif" font-size="16">
          Méthode: Sharp + SVG
        </text>
      </svg>
    `;

    // Convertir SVG en PNG avec Sharp
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération de l'image Sharp:", error);
    return new NextResponse("Erreur lors de la génération de l'image", {
      status: 500,
    });
  }
}
