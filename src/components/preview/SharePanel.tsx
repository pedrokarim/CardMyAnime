"use client";

import { useState, type CSSProperties } from "react";
import { Check, Code2, Copy, Download } from "lucide-react";
import { BrandIcon, type BrandName } from "@/components/preview/BrandIcons";
import { capturePartage } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface SharePanelProps {
  /** URL publique de la carte, absolue. */
  cardUrl: string;
  /** Page du site vers laquelle l'image pointe une fois intégrée. */
  siteUrl: string;
  username: string;
  cardType: string;
  onDownload: () => void;
  disabled?: boolean;
}

const MESSAGE = "Mon profil anime en une image";

/**
 * Réseaux de partage.
 *
 * `color` est la couleur de survol, et ce n'est pas toujours la couleur de
 * marque : celle de X est le noir et celle de Tumblr un bleu nuit. Sur un
 * panneau sombre, les reprendre telles quelles revient à éteindre l'icône au
 * moment précis où on la désigne. Ces deux-là sont éclaircies.
 *
 * Discord n'expose aucune URL de partage — on y colle un lien, que le client
 * déplie lui-même. Son bouton copie donc, il n'ouvre rien.
 */
const SOCIALS: {
  name: BrandName;
  label: string;
  color: string;
  href?: (url: string, text: string) => string;
  copy?: boolean;
}[] = [
  {
    name: "x",
    label: "Partager sur X",
    color: "#ffffff",
    href: (u, t) => `https://x.com/intent/post?text=${t}&url=${u}`,
  },
  {
    name: "discord",
    label: "Copier le lien pour Discord",
    color: "#5865F2",
    copy: true,
  },
  {
    name: "reddit",
    label: "Partager sur Reddit",
    color: "#FF4500",
    href: (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
  },
  {
    name: "bluesky",
    label: "Partager sur Bluesky",
    color: "#0285FF",
    href: (u, t) => `https://bsky.app/intent/compose?text=${t}%20${u}`,
  },
  {
    name: "telegram",
    label: "Partager sur Telegram",
    color: "#26A5E4",
    href: (u, t) => `https://t.me/share/url?url=${u}&text=${t}`,
  },
  {
    name: "whatsapp",
    label: "Partager sur WhatsApp",
    color: "#25D366",
    href: (u, t) => `https://wa.me/?text=${t}%20${u}`,
  },
  {
    name: "facebook",
    label: "Partager sur Facebook",
    color: "#0866FF",
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  },
  {
    name: "tumblr",
    label: "Partager sur Tumblr",
    color: "#7D9BC4",
    href: (u, t) =>
      `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${u}&caption=${t}`,
  },
];

export function SharePanel({
  cardUrl,
  siteUrl,
  username,
  cardType,
  onDownload,
  disabled = false,
}: SharePanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied((current) => (current === type ? null : current)), 2000);
      /*
       * Après l'écriture et pas avant : une copie refusée par le navigateur —
       * permission, contexte non sécurisé — n'est pas un partage, et c'est le
       * seul cas où l'utilisateur repart les mains vides.
       *
       * Le format copié part, le contenu non : il porte le pseudo et l'URL de
       * la carte.
       */
      capturePartage(type, cardType);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
    }
  };

  const embeds = [
    {
      type: "bbcode",
      label: "BBCode",
      icon: <Code2 className="h-3 w-3" />,
      content: `[url=${siteUrl}][img]${cardUrl}[/img][/url]`,
    },
    {
      type: "markdown",
      label: "Markdown",
      icon: <BrandIcon name="markdown" className="h-3 w-3" />,
      content: `[![${username} - ${cardType}](${cardUrl})](${siteUrl})`,
    },
    {
      type: "html",
      label: "HTML",
      icon: <BrandIcon name="html5" className="h-3 w-3" />,
      content: `<a href="${siteUrl}" target="_blank"><img src="${cardUrl}" alt="${username} - ${cardType}" /></a>`,
    },
  ];

  const encodedUrl = encodeURIComponent(cardUrl);
  const encodedText = encodeURIComponent(MESSAGE);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        Partager
      </h3>

      <div className="flex gap-2">
        <input
          readOnly
          value={cardUrl}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus-visible:border-primary/60"
        />
        <button
          type="button"
          onClick={() => copy(cardUrl, "url")}
          aria-label="Copier le lien de la carte"
          className="shrink-0 rounded-lg border border-border/70 px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {copied === "url" ? (
            <Check className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5"
        style={{
          background:
            "linear-gradient(92deg, var(--primary), color-mix(in srgb, var(--primary) 62%, white))",
          boxShadow:
            "0 8px 22px color-mix(in srgb, var(--primary) 30%, transparent)",
        }}
      >
        <Download className="h-4 w-4" />
        Télécharger le PNG
      </button>

      {/* « Partager » recouvre trois gestes très différents — récupérer le
          fichier, coller du code, publier. Sans ces intitulés, les onze
          boutons se lisent comme une seule liste. */}
      <p className="mb-2 mt-3.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        Intégrer
      </p>
      <div className="flex gap-1.5">
        {embeds.map((embed) => (
          <button
            key={embed.type}
            type="button"
            onClick={() => copy(embed.content, embed.type)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/70 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {copied === embed.type ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              embed.icon
            )}
            {copied === embed.type ? "Copié" : embed.label}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-3.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        Partager sur
      </p>
      <div className="flex gap-1.5">
        {SOCIALS.map((social) => {
          const className = cn(
            "grid h-[34px] flex-1 place-items-center rounded-lg border border-border/70",
            "text-muted-foreground transition-[color,background-color,border-color,transform] duration-200",
            "hover:border-foreground/25 hover:bg-accent/60 hover:text-(--brand)",
            "motion-safe:hover:-translate-y-0.5"
          );
          // Le libellé ne descend pas sous l'icône : huit colonnes de 38 px
          // dans un panneau de 348 seraient illisibles, et c'est précisément
          // le travail d'un logo. Il est porté par `title` et `aria-label`.
          const style = { "--brand": social.color } as CSSProperties;

          if (social.copy) {
            return (
              <button
                key={social.name}
                type="button"
                title={social.label}
                aria-label={social.label}
                style={style}
                onClick={() => copy(cardUrl, social.name)}
                className={className}
              >
                {copied === social.name ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <BrandIcon name={social.name} className="h-4 w-4" />
                )}
              </button>
            );
          }

          return (
            <a
              key={social.name}
              href={social.href!(encodedUrl, encodedText)}
              target="_blank"
              rel="noopener noreferrer"
              title={social.label}
              aria-label={social.label}
              style={style}
              onClick={() => capturePartage(social.name, cardType)}
              className={className}
            >
              <BrandIcon name={social.name} className="h-4 w-4" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
