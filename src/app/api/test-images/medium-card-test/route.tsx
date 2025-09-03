import { ImageResponse } from "@vercel/og";

export async function GET() {
  try {
    // Données de test en dur pour reproduire exactement mediumCard.ts
    const testData = {
      username: "TestUser123",
      stats: {
        animesSeen: 247,
        mangasRead: 89,
        avgScore: 8.7,
      },
      lastAnimes: [
        { title: "One Piece" },
        { title: "Naruto Shippuden" },
        { title: "Attack on Titan" },
        { title: "Demon Slayer" },
      ],
      lastMangas: [
        { title: "Berserk" },
        { title: "Vagabond" },
        { title: "Kingdom" },
        { title: "Vinland Saga" },
      ],
    };

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
            color: "white",
            fontFamily: "Arial, sans-serif",
            padding: "20px",
            position: "relative",
          }}
        >
          {/* Bloc principal noir transparent */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            {/* En-tête avec avatar et nom */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#4f46e5",
                  borderRadius: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  marginRight: "20px",
                }}
              >
                👤
              </div>

              {/* Informations utilisateur */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  {testData.username}
                </div>
                <div style={{ fontSize: "14px", color: "#e0e0e0" }}>
                  Animes vus: {testData.stats.animesSeen}
                </div>
                <div style={{ fontSize: "14px", color: "#e0e0e0" }}>
                  Mangas lus: {testData.stats.mangasRead}
                </div>
                <div style={{ fontSize: "14px", color: "#ffd700" }}>
                  Note moyenne: {testData.stats.avgScore}/10
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div
              style={{
                display: "flex",
                flex: 1,
                gap: "40px",
              }}
            >
              {/* Section animes */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    color: "#ffffff",
                  }}
                >
                  Derniers animes:
                </div>
                {testData.lastAnimes.map((anime, index) => (
                  <div
                    key={`anime-${index}`}
                    style={{
                      fontSize: "14px",
                      color: "#e0e0e0",
                      marginBottom: "8px",
                    }}
                  >
                    {index + 1}. {anime.title}
                  </div>
                ))}
              </div>

              {/* Section mangas */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    color: "#ffffff",
                  }}
                >
                  Derniers mangas:
                </div>
                {testData.lastMangas.map((manga, index) => (
                  <div
                    key={`manga-${index}`}
                    style={{
                      fontSize: "14px",
                      color: "#e0e0e0",
                      marginBottom: "8px",
                    }}
                  >
                    {index + 1}. {manga.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Watermark */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontSize: "12px",
                color: "rgba(255,255,255,0.6)",
                marginTop: "auto",
              }}
            >
              <div>CardMyAnime</div>
              <div>Test Medium Card</div>
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 300,
      }
    );
  } catch (error) {
    console.error("Erreur lors de la génération de la carte medium:", error);
    return new Response("Erreur lors de la génération de l'image", {
      status: 500,
    });
  }
}
