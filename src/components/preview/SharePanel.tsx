"use client";

import { useState } from "react";
import { Check, Code2, Copy, Download, ImageIcon } from "lucide-react";
import { BrandIcon, type BrandName } from "@/components/preview/BrandIcons";
import { capturePartage } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useTraduction } from "@/lib/i18n/client";

interface SharePanelProps {
  /** URL publique de la carte, absolue. */
  cardUrl: string;
  /** Page du site vers laquelle l'image pointe une fois intégrée. */
  siteUrl: string;
  username: string;
  cardType: string;
  onDownload: () => void;
  disabled?: boolean;
  /** Titre du panneau ; « Partager votre carte » par défaut. */
  title?: string;
  /** Texte joint aux partages sur les réseaux. */
  shareText?: string;
  /**
   * Page de partage, absolue. C'est elle qui part sur les réseaux : elle porte
   * les balises Open Graph, là où un lien vers le PNG ne donne qu'un lien nu.
   * Les codes d'intégration, eux, gardent l'image.
   */
  sharePageUrl?: string;
}

/**
 * Réseaux de partage.
 *
 * `brand` pose la couleur de survol dans `--brand`. Elle n'est pas toujours
 * la couleur de marque, et **elle dépend du thème** : celle de X est le noir
 * et celle de Tumblr un bleu nuit. Les garder telles quelles les éteint sur
 * fond sombre ; les éclaircir pour le mode sombre rend X invisible sur fond
 * clair — un blanc sur blanc au moment précis où on désigne l'icône. Ces
 * deux-là portent donc une valeur par thème.
 *
 * Les classes sont écrites en toutes lettres : Tailwind lit les sources, une
 * classe assemblée à l'exécution ne serait jamais générée.
 *
 * Discord n'expose aucune URL de partage — on y colle un lien, que le client
 * déplie lui-même. Son bouton copie donc, il n'ouvre rien.
 */
const SOCIALS: {
  name: BrandName;
  /** Nom de marque, jamais traduit ; le libellé du bouton se compose autour. */
  reseau: string;
  brand: string;
  href?: (url: string, text: string) => string;
  copy?: boolean;
}[] = [
  {
    name: "x",
    reseau: "X",
    brand: "[--brand:#0f1419] dark:[--brand:#ffffff]",
    href: (u, t) => `https://x.com/intent/post?text=${t}&url=${u}`,
  },
  {
    name: "discord",
    reseau: "Discord",
    brand: "[--brand:#5865F2]",
    copy: true,
  },
  {
    name: "reddit",
    reseau: "Reddit",
    brand: "[--brand:#FF4500]",
    href: (u, t) => `https://www.reddit.com/submit?url=${u}&title=${t}`,
  },
  {
    name: "bluesky",
    reseau: "Bluesky",
    brand: "[--brand:#0285FF]",
    href: (u, t) => `https://bsky.app/intent/compose?text=${t}%20${u}`,
  },
  {
    name: "telegram",
    reseau: "Telegram",
    brand: "[--brand:#1E90C4] dark:[--brand:#26A5E4]",
    href: (u, t) => `https://t.me/share/url?url=${u}&text=${t}`,
  },
  {
    name: "whatsapp",
    reseau: "WhatsApp",
    brand: "[--brand:#128C4A] dark:[--brand:#25D366]",
    href: (u, t) => `https://wa.me/?text=${t}%20${u}`,
  },
  {
    name: "facebook",
    reseau: "Facebook",
    brand: "[--brand:#0866FF]",
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  },
  {
    name: "tumblr",
    reseau: "Tumblr",
    brand: "[--brand:#36465D] dark:[--brand:#7D9BC4]",
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
  title,
  shareText,
  sharePageUrl,
}: SharePanelProps) {
  const { t } = useTraduction();
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setCopyError(null);
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
      // Presse-papiers refusé (permission, contexte non sécurisé) : sans retour
      // visible, l'utilisateur croit avoir copié et colle du vide.
      console.error("Erreur lors de la copie:", error);
      setCopied(null);
      setCopyError(t.partage.erreurCopie);
    }
  };

  /*
   * Copier l'image elle-même, et non son lien : collée dans un message, elle
   * part comme un vrai média, ce qu'aucune URL de partage ne permet.
   *
   * La promesse est confiée telle quelle à `ClipboardItem` : Safari exige que
   * l'écriture parte dans le geste de l'utilisateur, avant tout `await`.
   */
  const copyImage = async () => {
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        throw new Error("Copie d'image non prise en charge");
      }
      const blob = fetch(cardUrl).then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied("image");
      setCopyError(null);
      setTimeout(() => setCopied((current) => (current === "image" ? null : current)), 2000);
      capturePartage("image", cardType);
    } catch (error) {
      console.error("Erreur lors de la copie de l'image:", error);
      setCopied(null);
      setCopyError(t.partage.copyImageError);
    }
  };

  const embeds = [
    {
      type: "bbcode",
      label: t.partage.bbcode,
      icon: <Code2 aria-hidden="true" className="h-3 w-3" />,
      content: `[url=${siteUrl}][img]${cardUrl}[/img][/url]`,
    },
    {
      type: "markdown",
      label: t.partage.markdown,
      icon: <BrandIcon aria-hidden="true" name="markdown" className="h-3 w-3" />,
      content: `[![${username} - ${cardType}](${cardUrl})](${siteUrl})`,
    },
    {
      type: "html",
      label: t.partage.html,
      icon: <BrandIcon aria-hidden="true" name="html5" className="h-3 w-3" />,
      content: `<a href="${siteUrl}" target="_blank"><img src="${cardUrl}" alt="${username} - ${cardType}" /></a>`,
    },
  ];

  const socialUrl = sharePageUrl ?? cardUrl;
  const encodedUrl = encodeURIComponent(socialUrl);
  const encodedText = encodeURIComponent(shareText ?? t.partage.messageSocial);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title ?? t.partage.titre}
      </h3>

      {/* Le passage d'une icône « copier » à une coche est le seul retour de
          l'action : hors région live, il est muet pour un lecteur d'écran. */}
      <div aria-live="polite" className="sr-only">
        {copied ? t.partage.copieAnnonce(copied) : ""}
      </div>

      {copyError && (
        <p role="alert" className="mb-2 text-[11.5px] text-destructive">
          {copyError}
        </p>
      )}

      <div className="flex gap-2">
        <label htmlFor="lien-carte" className="sr-only">
          {t.partage.lienCarte}
        </label>
        <input
          id="lien-carte"
          name="lien-carte"
          readOnly
          value={cardUrl}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          onClick={() => copy(cardUrl, "url")}
          aria-label={t.partage.copierLien}
          className="shrink-0 rounded-lg border border-border/70 px-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied === "url" ? (
            <Check aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy aria-hidden="true" className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={disabled}
          title={t.partage.telecharger}
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-transform disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(92deg, var(--primary), color-mix(in srgb, var(--primary) 62%, white))",
            boxShadow:
              "0 8px 22px color-mix(in srgb, var(--primary) 30%, transparent)",
          }}
        >
          <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate">{t.partage.telecharger}</span>
        </button>
        <button
          type="button"
          onClick={copyImage}
          disabled={disabled}
          title={t.partage.copyImageHint}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/60 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied === "image" ? (
            <Check aria-hidden="true" className="h-4 w-4 text-primary" />
          ) : (
            <ImageIcon aria-hidden="true" className="h-4 w-4" />
          )}
          {copied === "image" ? t.partage.copieCourt : t.partage.copyImage}
        </button>
      </div>

      {/* « Partager » recouvre trois gestes très différents — récupérer le
          fichier, coller du code, publier. Sans ces intitulés, les onze
          boutons se lisent comme une seule liste. */}
      <p className="mb-2 mt-3.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {t.partage.integrer}
      </p>
      <div className="flex gap-1.5">
        {embeds.map((embed) => (
          <button
            key={embed.type}
            type="button"
            onClick={() => copy(embed.content, embed.type)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border/70 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied === embed.type ? (
              <Check aria-hidden="true" className="h-3 w-3 text-primary" />
            ) : (
              embed.icon
            )}
            {copied === embed.type ? t.partage.copieCourt : embed.label}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-3.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {t.partage.partagerSur}
      </p>
      <div className="flex gap-1.5">
        {SOCIALS.map((social) => {
          // Le libellé ne descend pas sous l'icône : huit colonnes de 38 px
          // dans un panneau de 348 seraient illisibles, et c'est précisément
          // le travail d'un logo. Il est porté par `title` et `aria-label`.
          const libelle = social.copy
            ? t.partage.copierPourDiscord
            : t.partage.partagerReseau(social.reseau);

          const className = cn(
            "grid h-[34px] flex-1 place-items-center rounded-lg border border-border/70",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "text-muted-foreground transition-[color,background-color,border-color,transform] duration-200",
            "hover:border-foreground/25 hover:bg-accent/60 hover:text-(--brand)",
            "motion-safe:hover:-translate-y-0.5",
            social.brand
          );

          if (social.copy) {
            return (
              <button
                key={social.name}
                type="button"
                title={libelle}
                aria-label={libelle}
                onClick={() => copy(socialUrl, social.name)}
                className={className}
              >
                {copied === social.name ? (
                  <Check aria-hidden="true" className="h-4 w-4 text-primary" />
                ) : (
                  <BrandIcon aria-hidden="true" name={social.name} className="h-4 w-4" />
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
              title={libelle}
              aria-label={libelle}
              onClick={() => capturePartage(social.name, cardType)}
              className={className}
            >
              <BrandIcon aria-hidden="true" name={social.name} className="h-4 w-4" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
