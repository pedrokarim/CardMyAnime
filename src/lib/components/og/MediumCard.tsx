import { ImageResponse } from "@vercel/og";

interface MediumCardProps {
  title: string;
  username: string;
  platform: string;
  score?: number;
  status?: string;
  episodes?: number;
}

export default function MediumCard({
  title,
  username,
  platform,
  score,
  status,
  episodes,
}: MediumCardProps) {
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
      {/* Background overlay */}
      <div
        style={{
          position: "absolute",
          top: "20px",
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
          top: "30px",
          left: "30px",
          width: "100px",
          height: "100px",
          borderRadius: "50px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "48px" }}>👤</span>
      </div>

      {/* Username */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "150px",
          fontSize: "32px",
          fontWeight: "bold",
        }}
      >
        {username}
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          top: "95px",
          left: "150px",
          fontSize: "16px",
          color: "#e0e0e0",
        }}
      >
        Animes vus: 0
      </div>

      <div
        style={{
          position: "absolute",
          top: "115px",
          left: "150px",
          fontSize: "16px",
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
            top: "135px",
            left: "150px",
            fontSize: "16px",
            color: "#ffd700",
          }}
        >
          Note moyenne: ★ {score}
        </div>
      ) : null}

      {/* Recent anime */}
      <div
        style={{
          position: "absolute",
          top: "180px",
          left: "30px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        Derniers animes:
      </div>

      <div
        style={{
          position: "absolute",
          top: "210px",
          left: "30px",
          fontSize: "14px",
          color: "#ffffff",
        }}
      >
        1. {title}
      </div>

      {/* Status and episodes */}
      <div
        style={{
          position: "absolute",
          top: "230px",
          left: "30px",
          fontSize: "14px",
          color: "#e0e0e0",
        }}
      >
        {status ? `Status: ${status}` : ""}{" "}
        {episodes ? `• ${episodes} épisodes` : ""}
      </div>
    </div>
  );
}
