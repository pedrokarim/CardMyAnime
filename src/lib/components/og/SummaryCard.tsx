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
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Background overlay */}
      <div
        style={{
          position: "absolute",
          top: "25px",
          left: "25px",
          right: "25px",
          bottom: "25px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "10px",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
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
        {score ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "24px", display: "block" }}>★</span>
            <span
              style={{ fontSize: "24px", fontWeight: "bold", display: "block" }}
            >
              {score}/10
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
