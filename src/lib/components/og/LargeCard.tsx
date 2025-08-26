import { ImageResponse } from "@vercel/og";

interface LargeCardProps {
  title: string;
  username: string;
  platform: string;
  score?: number;
  status?: string;
  episodes?: number;
  imageUrl?: string;
}

export default function LargeCard({
  title,
  username,
  platform,
  score,
  status,
  episodes,
  imageUrl,
}: LargeCardProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Background overlay for header */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          height: "170px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "10px",
        }}
      />

      {/* Background overlay for content */}
      <div
        style={{
          position: "absolute",
          top: "190px",
          left: "20px",
          right: "20px",
          bottom: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "10px",
        }}
      />

      {/* Avatar */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          width: "120px",
          height: "120px",
          borderRadius: "60px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "48px", display: "block" }}>👤</span>
      </div>

      {/* Username */}
      <div
        style={{
          position: "absolute",
          top: "70px",
          left: "180px",
          fontSize: "36px",
          fontWeight: "bold",
        }}
      >
        {username}
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          top: "110px",
          left: "180px",
          fontSize: "18px",
          color: "#e0e0e0",
        }}
      >
        Animes vus: 0
      </div>

      <div
        style={{
          position: "absolute",
          top: "135px",
          left: "180px",
          fontSize: "18px",
          color: "#e0e0e0",
        }}
      >
        Mangas lus: 0
      </div>

      {/* Score */}
      {score ? (
        <div
          style={{
            position: "absolute",
            top: "160px",
            left: "180px",
            fontSize: "18px",
            color: "#ffd700",
          }}
        >
          Note moyenne: ★ {score}
        </div>
      ) : null}

      {/* Recent animes section */}
      <div
        style={{
          position: "absolute",
          top: "220px",
          left: "40px",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        Derniers animes:
      </div>

      <div
        style={{
          position: "absolute",
          top: "250px",
          left: "40px",
          fontSize: "16px",
          color: "#ffffff",
        }}
      >
        1. {title}
      </div>

      {/* Status and episodes */}
      <div
        style={{
          position: "absolute",
          top: "270px",
          left: "40px",
          fontSize: "16px",
          color: "#e0e0e0",
        }}
      >
        {status ? `Status: ${status}` : ""}{" "}
        {episodes ? `• ${episodes} épisodes` : ""}
      </div>

      {/* Recent mangas section */}
      <div
        style={{
          position: "absolute",
          top: "320px",
          left: "40px",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        Derniers mangas:
      </div>

      <div
        style={{
          position: "absolute",
          top: "350px",
          left: "40px",
          fontSize: "16px",
          color: "#ffffff",
        }}
      >
        Aucun manga récent
      </div>
    </div>
  );
}
