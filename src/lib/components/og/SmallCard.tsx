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
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a1a",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "14px", color: "#888" }}>@{username}</span>
        <span style={{ fontSize: "14px", color: "#888" }}>{platform}</span>
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "10px",
          lineHeight: "1.2",
        }}
      >
        {title}
      </div>
      {score && (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "16px" }}>★</span>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {score}/10
          </span>
        </div>
      )}
    </div>
  );
}
