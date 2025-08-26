import { ImageResponse } from "@vercel/og";

interface SummaryCardProps {
  title: string;
  username: string;
  platform: string;
  score?: number;
}

export default function SummaryCard({
  title,
  username,
  platform,
  score,
}: SummaryCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a1a",
        color: "white",
        padding: "25px",
        fontFamily: "Arial, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "20px", color: "#888", marginBottom: "15px" }}>
        @{username} • {platform}
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "20px",
          lineHeight: "1.3",
        }}
      >
        {title}
      </div>
      {score && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "24px" }}>★</span>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            {score}/10
          </span>
        </div>
      )}
    </div>
  );
}
