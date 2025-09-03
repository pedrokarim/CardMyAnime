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
            fontFamily: "Inter, Arial, sans-serif",
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            padding: "40px",
          }}
        >
          {/* Titre principal avec ombre */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              marginBottom: "30px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            Test Avancé Vercel OG
          </div>

          {/* Sous-titre avec style */}
          <div
            style={{
              fontSize: "28px",
              marginBottom: "40px",
              opacity: 0.9,
              textAlign: "center",
            }}
          >
            Test complet des capacités de @vercel/og
          </div>

          {/* Grille de tests */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "40px",
              marginBottom: "30px",
            }}
          >
            {/* Colonne gauche */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#ffd700",
                }}
              >
                Tests de Texte
              </div>
              <div style={{ fontSize: "16px", textAlign: "center" }}>
                Accents : é è à ç ù
              </div>
              <div style={{ fontSize: "16px", textAlign: "center" }}>
                Caractères spéciaux : @#$%&*
              </div>
            </div>

            {/* Colonne droite */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#ff6b6b",
                }}
              >
                Tests d'Emojis
              </div>
              <div style={{ fontSize: "24px" }}>🎌 🍜 🎭 ⚡ 🚀</div>
              <div style={{ fontSize: "24px" }}>🌟 💫 ✨ 🎨 🎪</div>
            </div>
          </div>

          {/* Informations techniques */}
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
            <div>Méthode: @vercel/og avec ImageResponse</div>
            <div>Dimensions: 800x400</div>
            <div>Support: Texte, Emojis, Styles CSS</div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 400,
      }
    );
  } catch (error) {
    console.error("Erreur lors de la génération de l'image avancée:", error);
    return new Response("Erreur lors de la génération de l'image", {
      status: 500,
    });
  }
}
