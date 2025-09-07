import { ImageResponse } from "@vercel/og";
import { SITE_CONFIG } from "@/lib/constants";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

export async function GET() {
  // Charger les images depuis le système de fichiers
  let logoBase64 = "";
  let anilistBase64 = "";
  let malBase64 = "";
  let nautiljonBase64 = "";

  try {
    const logoPath = join(process.cwd(), "public", "images", "cma-logo.png");
    const anilistPath = join(
      process.cwd(),
      "public",
      "images",
      "anilist-android-chrome-512x512.png"
    );
    const malPath = join(
      process.cwd(),
      "public",
      "images",
      "MAL_Favicon_2020.png"
    );
    const nautiljonPath = join(
      process.cwd(),
      "public",
      "images",
      "nautiljon-logo.jpg"
    );

    const [logoBuffer, anilistBuffer, malBuffer, nautiljonBuffer] =
      await Promise.all([
        readFile(logoPath),
        readFile(anilistPath),
        readFile(malPath),
        readFile(nautiljonPath),
      ]);

    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    anilistBase64 = `data:image/png;base64,${anilistBuffer.toString("base64")}`;
    malBase64 = `data:image/png;base64,${malBuffer.toString("base64")}`;
    nautiljonBase64 = `data:image/jpeg;base64,${nautiljonBuffer.toString(
      "base64"
    )}`;
  } catch (error) {
    console.error("Erreur lors du chargement des images:", error);
    // Fallback vers la version sans images
  }
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      >
        {/* Logo principal - Version simplifiée sans image externe */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          {logoBase64 ? (
            <img
              src={logoBase64}
              alt="CardMyAnime Logo"
              width="120"
              height="120"
              style={{
                borderRadius: "20px",
                marginRight: "30px",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: "#667eea",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "30px",
                fontSize: "48px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              CMA
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <h1
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "#ffffff",
                margin: "0",
                lineHeight: "1",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {SITE_CONFIG.site.name}
            </h1>
            <p
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
                margin: "10px 0 0 0",
                fontWeight: "400",
              }}
            >
              Générateur de cartes de profil anime
            </p>
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "800px",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              fontSize: "28px",
              color: "#ffffff",
              margin: "0 0 20px 0",
              lineHeight: "1.4",
            }}
          >
            {SITE_CONFIG.site.description}
          </p>
          <p
            style={{
              fontSize: "20px",
              color: "#71717a",
              margin: "0",
              lineHeight: "1.3",
            }}
          >
            AniList • MyAnimeList • Nautiljon
          </p>
        </div>

        {/* Logos des plateformes - Version simplifiée */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            marginBottom: "20px",
          }}
        >
          {anilistBase64 ? (
            <img
              src={anilistBase64}
              alt="AniList"
              width="60"
              height="60"
              style={{ borderRadius: "12px" }}
            />
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#02a9ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              AL
            </div>
          )}
          {malBase64 ? (
            <img
              src={malBase64}
              alt="MyAnimeList"
              width="60"
              height="60"
              style={{ borderRadius: "12px" }}
            />
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#2e51a2",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              MAL
            </div>
          )}
          {nautiljonBase64 ? (
            <img
              src={nautiljonBase64}
              alt="Nautiljon"
              width="60"
              height="60"
              style={{ borderRadius: "12px" }}
            />
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                backgroundColor: "#ff6b35",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              NJ
            </div>
          )}
        </div>

        {/* Footer avec crédits */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            marginTop: "20px",
            paddingTop: "0px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                color: "#71717a",
              }}
            >
              Développé par
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#ffffff",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {SITE_CONFIG.creator.pseudo}
            </span>
          </div>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#71717a",
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontSize: "16px",
              color: "#71717a",
            }}
          >
            Open Source • Gratuit • Communauté
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
