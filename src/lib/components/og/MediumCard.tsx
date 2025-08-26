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
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a1a",
        color: "white",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <span style={{ fontSize: "16px", color: "#888" }}>@{username}</span>
        <span style={{ fontSize: "16px", color: "#888" }}>{platform}</span>
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "15px",
          lineHeight: "1.3",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {score && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>★</span>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>
              {score}/10
            </span>
          </div>
        )}
        {status && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>👤</span>
            <span style={{ fontSize: "18px" }}>{status}</span>
          </div>
        )}
        {episodes && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📺</span>
            <span style={{ fontSize: "18px" }}>{episodes} épisodes</span>
          </div>
        )}
      </div>
    </div>
  );
}
