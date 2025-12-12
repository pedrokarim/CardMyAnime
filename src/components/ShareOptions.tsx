"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/ui/platform-icon";

interface ShareOptionsProps {
  shareableUrl: string;
  username: string;
  platform: string | null;
  cardType: string;
  useLastAnimeBackground: boolean;
}

export default function ShareOptions({
  shareableUrl,
  username,
  platform,
  cardType,
  useLastAnimeBackground,
}: ShareOptionsProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const fullUrl = `${baseUrl}${shareableUrl}`;

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  const shareOptions = [
    {
      type: "markdown",
      label: "Markdown",
      icon: "📝",
      content: `[![${username} - ${cardType}](${fullUrl})](${baseUrl})`,
    },
    {
      type: "bbcode",
      label: "BB Code",
      icon: "🔗",
      content: `[url=${baseUrl}][img]${fullUrl}[/img][/url]`,
    },
    {
      type: "html",
      label: "HTML Embed",
      icon: "🌐",
      content: `<a href="${baseUrl}" target="_blank"><img src="${fullUrl}" alt="${username} - ${cardType}" /></a>`,
    },
    {
      type: "url",
      label: "URL Directe",
      icon: "🔗",
      content: fullUrl,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <PlatformIcon platform={platform as any} size={32} />
          <h3 className="text-2xl font-bold text-foreground">
            Partager votre carte
          </h3>
        </div>
        <p className="text-muted-foreground">
          Copiez le code correspondant à votre plateforme pour intégrer votre
          carte
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {shareOptions.map((option) => (
          <div
            key={option.type}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{option.icon}</span>
                <span className="font-semibold text-foreground">
                  {option.label}
                </span>
              </div>
              <Button
                onClick={() => copyToClipboard(option.content, option.type)}
                variant={copiedType === option.type ? "default" : "outline"}
                className="px-6 py-2 w-full sm:w-auto"
              >
                {copiedType === option.type ? "✓ Copié !" : "Copier"}
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <code className="text-sm text-muted-foreground break-all">
                {option.content}
              </code>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          💡 <strong>Conseil :</strong> Utilisez Markdown pour GitHub, Discord,
          ou les forums. BB Code pour les forums qui le supportent. HTML pour
          les sites web. L'image sera cliquable et redirigera vers le site !
        </p>
      </div>
    </div>
  );
}
