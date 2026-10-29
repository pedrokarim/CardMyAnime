"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { Check, Loader2, Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { SharePanel } from "@/components/preview/SharePanel";
import { trpc } from "@/lib/trpc/client";
import { useTraduction } from "@/lib/i18n/client";
import { captureAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  TOP_MAX_SIZE,
  TOP_MEDIA_TYPES,
  TOP_MIN_SIZE,
  TOP_PRESET_SIZES,
  buildTopPath,
  buildTopSharePath,
  clampTopSize,
  type TopMediaType,
} from "@/lib/tops/topConfig";

/*
 * Nautiljon n'y figure pas : la plateforme est suspendue, et ses profils
 * n'exposent de toute façon qu'un top 5 sans notes.
 */
const TOP_PLATFORMS = ["anilist", "mal", "kitsu", "shikimori", "bangumi"] as const;
type TopPlatform = (typeof TOP_PLATFORMS)[number];

const PLATFORM_LABELS: Record<TopPlatform, string> = {
  anilist: "AniList",
  mal: "MyAnimeList",
  kitsu: "Kitsu",
  shikimori: "Shikimori",
  bangumi: "Bangumi",
};

/*
 * Profils publics de démonstration, un par plateforme, avec des tailles
 * variées pour montrer les différents rendus. Tous vérifiés le 2026-10-29 :
 * listes publiques et notées.
 */
const EXAMPLES: {
  platform: TopPlatform;
  username: string;
  media: TopMediaType;
  size: number;
}[] = [
  { platform: "anilist", username: "PedroKarim64", media: "anime", size: 5 },
  { platform: "mal", username: "PedroKarim64", media: "manga", size: 7 },
  { platform: "kitsu", username: "Nuck", media: "anime", size: 3 },
  { platform: "shikimori", username: "morr", media: "anime", size: 10 },
  { platform: "bangumi", username: "sai", media: "anime", size: 5 },
];

interface PreparedProfile {
  platform: TopPlatform;
  username: string;
  ratedCount: Record<TopMediaType, number>;
}

/** Groupe de boutons exclusifs ; `aria-pressed`, comme le rail de plateformes. */
function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  fitContent = false,
}: {
  label: string;
  options: { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (value: T) => void;
  /** Largeur selon le libellé : « Sur mesure » ne tient pas dans un cinquième. */
  fitContent?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="flex min-w-0 gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-[13px] font-medium transition-colors",
              fitContent ? "flex-auto whitespace-nowrap" : "flex-1",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/70 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  const className =
    "mb-2 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground";
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <p className={className}>{children}</p>
  );
}

/**
 * Création d'un top.
 *
 * Tout tient sur un écran : les réglages à gauche, l'image à droite. Le
 * profil est lu une fois ; ensuite, changer de contenu ou de taille ne fait
 * que changer l'URL de l'image, sans nouvel aller-retour par le serveur
 * applicatif – c'est exactement l'URL qui sera partagée.
 */
export default function TopsPage() {
  const { t } = useTraduction();

  const [platform, setPlatform] = useQueryState(
    "platform",
    parseAsStringLiteral(TOP_PLATFORMS).withDefault("anilist")
  );
  const [username, setUsername] = useQueryState("username", { defaultValue: "" });
  const [media, setMedia] = useQueryState(
    "media",
    parseAsStringLiteral(TOP_MEDIA_TYPES).withDefault("anime")
  );
  const [rawSize, setRawSize] = useQueryState("size", parseAsInteger.withDefault(5));
  const size = clampTopSize(rawSize);

  const [draft, setDraft] = useState(username);
  const [prepared, setPrepared] = useState<PreparedProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customSize, setCustomSize] = useState(
    !(TOP_PRESET_SIZES as readonly number[]).includes(size)
  );
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">("loading");
  const previewRef = useRef<HTMLDivElement>(null);

  const prepareTop = trpc.prepareTop.useMutation({
    onSuccess: (result, variables) => {
      if (!result.success) {
        setPrepared(null);
        setError(t.tops.error);
        return;
      }
      setError(null);
      setPrepared({
        platform: variables.platform as TopPlatform,
        username: result.username,
        ratedCount: result.ratedCount,
      });
      // La casse renvoyée par la plateforme, pas celle tapée.
      setDraft(result.username);
      setUsername(result.username);
      captureAnalytics("top_created", { platform: variables.platform });
      // Sur mobile, l'aperçu est sous le formulaire, hors champ : on l'amène.
      if (window.matchMedia("(max-width: 1023px)").matches) {
        requestAnimationFrame(() =>
          previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        );
      }
    },
    onError: () => {
      setPrepared(null);
      setError(t.tops.error);
    },
  });

  const submit = (value = draft) => {
    const trimmed = value.trim();
    if (!trimmed || prepareTop.isPending) return;
    prepareTop.mutate({ platform, username: trimmed });
  };

  /**
   * Un exemple règle tout le formulaire puis lance la lecture : on voit le
   * résultat sans avoir de pseudo sous la main. L'aperçu précédent est
   * retiré d'abord, sinon l'ancien profil s'afficherait un instant avec les
   * réglages du nouveau.
   */
  const tryExample = (example: (typeof EXAMPLES)[number]) => {
    if (prepareTop.isPending) return;
    setPrepared(null);
    setError(null);
    setPlatform(example.platform);
    setMedia(example.media);
    setRawSize(example.size);
    setCustomSize(!(TOP_PRESET_SIZES as readonly number[]).includes(example.size));
    setDraft(example.username);
    prepareTop.mutate({ platform: example.platform, username: example.username });
    captureAnalytics("top_example", { platform: example.platform });
  };

  // Arriver par un lien partagé (`?username=…`) lance la lecture tout seul.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || !username.trim()) return;
    autoStarted.current = true;
    submit(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const topPath = prepared
    ? buildTopPath(prepared.platform, prepared.username, media, size)
    : null;

  useEffect(() => {
    setImageState("loading");
  }, [topPath]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const ratedCount = prepared?.ratedCount[media] ?? 0;

  const download = () => {
    if (!topPath || !prepared) return;
    const link = document.createElement("a");
    link.href = topPath;
    link.download = `top-${media}-${size}-${prepared.username}.png`;
    link.click();
  };

  const changePlatform = (value: TopPlatform) => {
    if (value === platform) return;
    setPlatform(value);
    // Un pseudo n'a de sens que sur sa plateforme : l'aperçu repart de zéro.
    setPrepared(null);
    setError(null);
  };

  return (
    <main className="mx-auto w-[min(1120px,92vw)] pb-20 pt-10 sm:pt-14">
      <header className="mx-auto max-w-[62ch] text-center">
        <h1 className="text-[clamp(30px,4vw,44px)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground text-balance">
          {t.tops.title}
        </h1>
        <p className="mt-3 text-[16px] leading-[1.55] text-muted-foreground">
          {t.tops.subtitle}
        </p>
      </header>

      {/* Sur mobile, l'aperçu vient juste après le formulaire et l'explication
          ferme la marche ; sur grand écran, l'explication remonte sous le
          formulaire et l'aperçu occupe toute la colonne de droite. */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm lg:col-start-1 lg:row-start-1"
        >
          <div>
            {/* Liste déroulante et non boutons : cinq plateformes de front
                ne tiennent pas dans les 300 px du formulaire. */}
            <FieldLabel htmlFor="top-platform">{t.tops.platformLabel}</FieldLabel>
            <Select value={platform} onValueChange={(value) => changePlatform(value as TopPlatform)}>
              <SelectTrigger id="top-platform" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOP_PLATFORMS.map((value) => (
                  <SelectItem key={value} value={value}>
                    <PlatformIcon platform={value} size={18} className="shrink-0 rounded" />
                    {PLATFORM_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <FieldLabel htmlFor="top-username">{t.tops.usernameLabel}</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="top-username"
                name="username"
                autoComplete="off"
                spellCheck={false}
                placeholder={t.tops.usernamePlaceholder}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1"
              />
            </div>
          </div>

          <div>
            <FieldLabel>{t.tops.mediaLabel}</FieldLabel>
            <Segmented
              label={t.tops.mediaLabel}
              value={media}
              onChange={(value) => setMedia(value)}
              options={TOP_MEDIA_TYPES.map((value) => ({
                value,
                label: t.tops[value],
              }))}
            />
          </div>

          <div>
            <FieldLabel>{t.tops.sizeLabel}</FieldLabel>
            <Segmented<number | "custom">
              label={t.tops.sizeLabel}
              fitContent
              value={customSize ? "custom" : size}
              onChange={(value) => {
                if (value === "custom") {
                  setCustomSize(true);
                  return;
                }
                setCustomSize(false);
                setRawSize(value);
              }}
              options={[
                ...TOP_PRESET_SIZES.map((value) => ({ value, label: String(value) })),
                { value: "custom" as const, label: t.tops.custom },
              ]}
            />

            {customSize && (
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRawSize(clampTopSize(size - 1))}
                  disabled={size <= TOP_MIN_SIZE}
                  aria-label={t.tops.decrease}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Minus aria-hidden="true" className="h-4 w-4" />
                </button>
                <output
                  aria-live="polite"
                  className="min-w-[4.5ch] text-center text-lg font-semibold tabular-nums text-foreground"
                >
                  {t.tops.topOf(size)}
                </output>
                <button
                  type="button"
                  onClick={() => setRawSize(clampTopSize(size + 1))}
                  disabled={size >= TOP_MAX_SIZE}
                  aria-label={t.tops.increase}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
                <span className="min-w-0 text-[12.5px] text-muted-foreground">
                  {t.tops.customRange(TOP_MIN_SIZE, TOP_MAX_SIZE)}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!draft.trim() || prepareTop.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold text-primary-foreground transition-transform disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(92deg, var(--primary), color-mix(in srgb, var(--primary) 62%, white))",
              boxShadow:
                "0 8px 22px color-mix(in srgb, var(--primary) 30%, transparent)",
            }}
          >
            {prepareTop.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                {t.tops.loading}
              </>
            ) : (
              t.tops.submit
            )}
          </button>

          <div aria-live="polite" className="empty:hidden">
            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/15 p-3 text-[13px] text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="border-t border-border/60 pt-4">
            <p className="mb-2 text-[12.5px] text-muted-foreground">
              {t.tops.examplesTitle}
            </p>
            <ul className="flex flex-col gap-1">
              {EXAMPLES.map((example) => {
                const mediaLabel = t.tops[example.media].toLowerCase();
                return (
                  <li key={`${example.platform}-${example.username}`}>
                    <button
                      type="button"
                      onClick={() => tryExample(example)}
                      disabled={prepareTop.isPending}
                      aria-label={t.tops.exampleAria(
                        example.size,
                        mediaLabel,
                        example.username,
                        PLATFORM_LABELS[example.platform]
                      )}
                      className="flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent/60 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <PlatformIcon
                        platform={example.platform}
                        size={18}
                        className="shrink-0 rounded"
                      />
                      <span
                        title={example.username}
                        className="min-w-0 truncate font-medium text-foreground"
                      >
                        {example.username}
                      </span>
                      <span className="ml-auto shrink-0 text-muted-foreground">
                        {t.tops.topOf(example.size)} {mediaLabel}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </form>

        <div className="order-last min-w-0 px-1 lg:order-none lg:col-start-1 lg:row-start-2">
          <h2 className="mb-2 text-[13px] font-semibold text-foreground">
            {t.tops.howTitle}
          </h2>
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {t.tops.howItWorks.map((line) => (
              <li key={line} className="flex gap-2">
                <Check aria-hidden="true" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Aperçu et partage */}
        <div
          ref={previewRef}
          className="flex min-w-0 scroll-mt-24 flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <div className="relative grid min-h-[320px] place-items-center rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6">
            {topPath && prepared ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={topPath}
                  src={topPath}
                  alt={t.tops.previewAlt(size, t.tops[media], prepared.username)}
                  onLoad={() => setImageState("ready")}
                  onError={() => setImageState("error")}
                  className={cn(
                    "block h-auto max-w-full rounded-xl shadow-[0_18px_50px_rgba(0,0,0,.35)] transition-opacity duration-300",
                    imageState === "ready" ? "opacity-100" : "opacity-0"
                  )}
                />
                {imageState === "loading" && (
                  <div className="absolute inset-0 grid place-items-center">
                    <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
                    <span className="sr-only">{t.commun.chargement}</span>
                  </div>
                )}
                {imageState === "error" && (
                  <p className="absolute inset-0 grid place-items-center p-6 text-center text-[13.5px] text-muted-foreground">
                    {t.tops.imageError}
                  </p>
                )}
              </>
            ) : (
              <p className="max-w-[40ch] text-center text-[14px] leading-relaxed text-muted-foreground">
                {prepareTop.isPending ? t.tops.loading : t.tops.previewEmpty}
              </p>
            )}
          </div>

          {prepared && ratedCount < size && (
            <p className="px-1 text-[13px] text-muted-foreground">
              {t.tops.fewerRated(ratedCount, size)}
            </p>
          )}

          {prepared && topPath && (
            <SharePanel
              title={t.tops.shareTitle}
              shareText={t.tops.shareText}
              cardUrl={`${origin}${topPath}`}
              sharePageUrl={`${origin}${buildTopSharePath(
                prepared.platform,
                prepared.username,
                media,
                size
              )}`}
              siteUrl={`${origin}/tops`}
              username={prepared.username}
              cardType={`top-${media}-${size}`}
              onDownload={download}
              disabled={imageState !== "ready"}
            />
          )}
        </div>
      </div>
    </main>
  );
}
