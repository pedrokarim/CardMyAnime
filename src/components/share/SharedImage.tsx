import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

interface SharedImageProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  width?: number;
  height?: number;
  note: string;
  ctaHref: string;
  ctaLabel: string;
  profileHref: string;
  profileLabel: string;
}

/**
 * Corps commun des pages de partage : l'image en grand, puis de quoi en
 * faire une soi-même. Ces pages existent d'abord pour leurs balises Open
 * Graph ; quand quelqu'un clique sur l'aperçu, il doit voir l'image et
 * comprendre en une ligne ce qu'il peut en faire.
 */
export function SharedImage({
  title,
  description,
  imageSrc,
  imageAlt,
  width,
  height,
  note,
  ctaHref,
  ctaLabel,
  profileHref,
  profileLabel,
}: SharedImageProps) {
  return (
    <main className="mx-auto flex w-[min(1120px,92vw)] flex-col items-center pb-20 pt-10 text-center sm:pt-14">
      <h1 className="max-w-full break-words text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.1] tracking-[-0.02em] text-foreground text-balance">
        {title}
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15.5px] leading-[1.55] text-muted-foreground">
        {description}
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={imageAlt}
        width={width}
        height={height}
        className="mt-8 block h-auto max-w-full rounded-xl shadow-[0_18px_50px_rgba(0,0,0,.35)]"
      />

      <p className="mt-4 max-w-[60ch] text-[13px] text-muted-foreground">{note}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={ctaHref}
          className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3 text-[15px] font-semibold text-primary-foreground transition-transform duration-200 motion-safe:hover:-translate-y-0.5"
          style={{
            background:
              "linear-gradient(92deg, var(--primary), color-mix(in srgb, var(--primary) 62%, white))",
            boxShadow:
              "0 10px 28px color-mix(in srgb, var(--primary) 32%, transparent)",
          }}
        >
          {ctaLabel}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[3px]"
          />
        </Link>
        <a
          href={profileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 px-5 py-3 text-[15px] font-semibold text-foreground transition-colors hover:bg-accent/60"
        >
          {profileLabel}
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </main>
  );
}
