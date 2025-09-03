import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "TestUser";
    const platform = searchParams.get("platform") || "anilist";
    const animeTitle = searchParams.get("anime") || "Naruto";
    const score = searchParams.get("score") || "8.5";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "white",
            fontFamily: "Inter, Arial, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Arrière-plan avec overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.6) 50%, rgba(15, 52, 96, 0.4) 100%)",
            }}
          />

          {/* Contenu principal */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              padding: "30px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* En-tête avec avatar et nom d'utilisateur */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              {/* Avatar placeholder */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "20px",
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <span style={{ fontSize: "32px" }}>👤</span>
              </div>

              {/* Informations utilisateur */}
              <div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  {username}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#a0a0a0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>via {platform}</span>
                  <span>•</span>
                  <span>Score moyen: {score}</span>
                </div>
              </div>
            </div>

            {/* Titre de l'anime */}
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                marginBottom: "20px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                lineHeight: 1.2,
              }}
            >
              {animeTitle}
            </div>

            {/* Stats et informations */}
            <div
              style={{
                display: "flex",
                gap: "40px",
                marginBottom: "30px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#a0a0a0",
                    marginBottom: "4px",
                  }}
                >
                  Épisodes vus
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                  24/24
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#a0a0a0",
                    marginBottom: "4px",
                  }}
                >
                  Note personnelle
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#ffd700",
                  }}
                >
                  ★ 9.0
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#a0a0a0",
                    marginBottom: "4px",
                  }}
                >
                  Statut
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#4ade80",
                  }}
                >
                  Terminé
                </div>
              </div>
            </div>

            {/* Derniers animes */}
            <div style={{ marginTop: "auto" }}>
              <div
                style={{
                  fontSize: "18px",
                  color: "#a0a0a0",
                  marginBottom: "15px",
                }}
              >
                Derniers animes regardés :
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                {["One Piece", "Dragon Ball", "Bleach"].map((anime, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: "14px",
                      padding: "8px 16px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "20px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {anime}
                  </div>
                ))}
              </div>
            </div>

            {/* Watermark */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "monospace",
              }}
            >
              CardMyAnime
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 400,
      }
    );
  } catch (error) {
    console.error(
      "Erreur lors de la génération de la carte d'anime simulée:",
      error
    );
    return new Response("Erreur lors de la génération de l'image", {
      status: 500,
    });
  }
}
