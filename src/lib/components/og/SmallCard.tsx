import { ImageResponse } from "@vercel/og";

interface SmallCardProps {
  title: string;
  username: string;
  platform: string;
  score?: number;
}

export default function SmallCard({
  title,
  username,
  platform,
  score,
}: SmallCardProps) {
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
      {/* Avatar placeholder */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "24px" }}>👤</span>
      </div>

      {/* Username */}
      <div
        style={{
          position: "absolute",
          top: "45px",
          left: "100px",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        {username}
      </div>

      {/* Stats */}
      <div
        style={{
          position: "absolute",
          top: "70px",
          left: "100px",
          fontSize: "14px",
          color: "#e0e0e0",
        }}
      >
        Anime stats
      </div>

      {/* Recent animes */}
      <div
        style={{
          position: "absolute",
          top: "110px",
          left: "20px",
          fontSize: "12px",
          color: "#ffffff",
        }}
      >
        1. {title}
      </div>

      {/* Score */}
      {score ? (
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "20px",
            fontSize: "16px",
            color: "#ffd700",
          }}
        >
          ★ {score}
        </div>
      ) : null}
    </div>
  );
}
