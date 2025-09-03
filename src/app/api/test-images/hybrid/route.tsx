import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") || "Texte par défaut";
    const color = searchParams.get("color") || "#667eea";
    const size = searchParams.get("size") || "medium";

    // Déterminer la taille de la police selon le paramètre
    const getFontSize = (size: string) => {
      switch (size) {
        case "small":
          return "24px";
        case "large":
          return "64px";
        default:
          return "48px";
      }
    };

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, ${color} 0%, #764ba2 100%)`,
            color: "white",
            fontFamily: "Inter, Arial, sans-serif",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "40px",
          }}
        >
          {/* Titre principal */}
          <div
            style={{
              fontSize: getFontSize(size),
              fontWeight: "bold",
              marginBottom: "30px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              textAlign: "center",
              maxWidth: "90%",
              wordWrap: "break-word",
            }}
          >
            {text}
          </div>

          {/* Informations sur la méthode */}
          <div
            style={{
              fontSize: "18px",
              marginBottom: "20px",
              opacity: 0.9,
              textAlign: "center",
            }}
          >
            Méthode Hybride @vercel/og
          </div>

          {/* Paramètres utilisés */}
          <div
            style={{
              fontSize: "14px",
              color: "#e0e0e0",
              textAlign: "center",
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "8px",
            }}
          >
            <div>Texte: {text}</div>
            <div>Couleur: {color}</div>
            <div>Taille: {size}</div>
            <div>Timestamp: {new Date().toLocaleTimeString("fr-FR")}</div>
          </div>

          {/* Test d'emojis dynamiques */}
          <div
            style={{
              fontSize: "24px",
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            🎌 🍜 🎭 ⚡ 🚀 🌟 💫 ✨ 🎨 🎪
          </div>
        </div>
      ),
      {
        width: 800,
        height: 400,
      }
    );
  } catch (error) {
    console.error("Erreur lors de la génération de l'image hybride:", error);
    return new Response("Erreur lors de la génération de l'image", {
      status: 500,
    });
  }
}
