import { ImageResponse } from "@vercel/og";
import { SITE_CONFIG } from "@/lib/constants";

export const runtime = "edge";

export async function GET() {
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
        {/* Logo principal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <img
            src={`${SITE_CONFIG.site.url}${SITE_CONFIG.site.logo}`}
            alt="CardMyAnime Logo"
            width="120"
            height="120"
            style={{
              borderRadius: "20px",
              marginRight: "30px",
            }}
          />
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

        {/* Logos des plateformes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            marginBottom: "40px",
          }}
        >
          <img
            src={`${SITE_CONFIG.site.url}${SITE_CONFIG.images.platforms.anilist}`}
            alt="AniList"
            width="60"
            height="60"
            style={{ borderRadius: "12px" }}
          />
          <img
            src={`${SITE_CONFIG.site.url}${SITE_CONFIG.images.platforms.mal}`}
            alt="MyAnimeList"
            width="60"
            height="60"
            style={{ borderRadius: "12px" }}
          />
          <img
            src={`${SITE_CONFIG.site.url}${SITE_CONFIG.images.platforms.nautiljon}`}
            alt="Nautiljon"
            width="60"
            height="60"
            style={{ borderRadius: "12px" }}
          />
        </div>

        {/* Footer avec crédits */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            marginTop: "auto",
            paddingTop: "40px",
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
