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
        backgroundColor: "#1a1a1a",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {imageUrl && (
        <div style={{ width: "200px", height: "100%", position: "relative" }}>
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "18px", color: "#888" }}>@{username}</span>
            <span style={{ fontSize: "18px", color: "#888" }}>{platform}</span>
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "25px",
              lineHeight: "1.4",
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
          {score && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>★</span>
              <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                {score}/10
              </span>
            </div>
          )}
          {status && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>👤</span>
              <span style={{ fontSize: "22px" }}>{status}</span>
            </div>
          )}
          {episodes && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>📺</span>
              <span style={{ fontSize: "22px" }}>{episodes} épisodes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
