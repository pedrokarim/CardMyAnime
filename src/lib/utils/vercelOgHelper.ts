import { ImageResponse } from "@vercel/og";
import SmallCard from "@/lib/components/og/SmallCard";
import MediumCard from "@/lib/components/og/MediumCard";
import LargeCard from "@/lib/components/og/LargeCard";
import SummaryCard from "@/lib/components/og/SummaryCard";

interface VercelOgConfig {
  title: string;
  username: string;
  platform: string;
  score?: number;
  status?: string;
  episodes?: number;
  imageUrl?: string;
  type: "small" | "medium" | "large" | "summary" | "neon" | "minimal" | "glassmorphism";
}

export class VercelOgHelper {
  static async generateCard(config: VercelOgConfig): Promise<Response> {
    const {
      type,
      title,
      username,
      platform,
      score,
      status,
      episodes,
      imageUrl,
    } = config;

    const dimensions = this.getDimensions(type);

    switch (type) {
      case "small":
        return new ImageResponse(
          SmallCard({ title, username, platform, score }),
          dimensions
        );
      case "medium":
        return new ImageResponse(
          MediumCard({ title, username, platform, score, status, episodes }),
          dimensions
        );
      case "large":
        return new ImageResponse(
          LargeCard({
            title,
            username,
            platform,
            score,
            status,
            episodes,
            imageUrl,
          }),
          dimensions
        );
      case "summary":
        return new ImageResponse(
          SummaryCard({ title, username, platform, score }),
          dimensions
        );
      default:
        return new ImageResponse(
          SmallCard({ title, username, platform, score }),
          dimensions
        );
    }
  }

  private static getDimensions(type: string) {
    switch (type) {
      case "small":
        return { width: 400, height: 200 };
      case "medium":
        return { width: 600, height: 300 };
      case "large":
        return { width: 800, height: 400 };
      case "summary":
        return { width: 500, height: 250 };
      case "neon":
        return { width: 600, height: 350 };
      case "minimal":
        return { width: 500, height: 250 };
      case "glassmorphism":
        return { width: 700, height: 400 };
      default:
        return { width: 400, height: 200 };
    }
  }
}
