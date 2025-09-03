import { ImageResponse } from "@vercel/og";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h1 style={{ fontSize: "48px", margin: "0 0 20px 0" }}>
            Test Image Vercel OG
          </h1>
          <p style={{ fontSize: "24px", margin: "0 0 20px 0" }}>
            Cette image est générée avec @vercel/og
          </p>
          <p style={{ fontSize: "18px", margin: "0" }}>
            Texte avec accents : é è à ç ù
          </p>
          <p style={{ fontSize: "18px", margin: "10px 0 0 0" }}>
            Emojis : 🎌 🍜 🎭 ⚡
          </p>
        </div>
      ),
      {
        width: 800,
        height: 400,
      }
    );
  } catch (error) {
    console.error("Erreur lors de la génération de l'image de test:", error);
    return new Response("Erreur lors de la génération de l'image", {
      status: 500,
    });
  }
}
