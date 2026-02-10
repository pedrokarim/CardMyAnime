import { CardType } from "@/lib/types";

interface CardStyleSvgProps {
  type: CardType;
  className?: string;
  size?: number;
}

/** Miniature SVG representing each card style's visual identity */
export function CardStyleSvg({ type, className, size = 80 }: CardStyleSvgProps) {
  const svgs: Record<CardType, React.ReactNode> = {
    small: <SmallCardSvg />,
    medium: <MediumCardSvg />,
    large: <LargeCardSvg />,
    summary: <SummaryCardSvg />,
    neon: <NeonCardSvg />,
    minimal: <MinimalCardSvg />,
    glassmorphism: <GlassCardSvg />,
  };

  // Keep aspect ratio based on card dimensions
  const aspectRatios: Record<CardType, number> = {
    small: 400 / 200,
    medium: 600 / 300,
    large: 800 / 500,
    summary: 800 / 600,
    neon: 600 / 350,
    minimal: 500 / 250,
    glassmorphism: 700 / 400,
  };

  const ratio = aspectRatios[type];
  const width = size;
  const height = size / ratio;

  return (
    <div
      className={className}
      style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {svgs[type]}
    </div>
  );
}

/* ─── SMALL ─── Dark card, small avatar, 3 text lines */
function SmallCardSvg() {
  return (
    <svg viewBox="0 0 100 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
      </defs>
      <rect width="100" height="50" rx="4" fill="url(#sm-bg)" />
      {/* Avatar */}
      <circle cx="18" cy="18" r="8" fill="#2a2a4a" stroke="#e0e0e0" strokeWidth="0.8" />
      <circle cx="18" cy="16" r="3" fill="#8b949e" />
      <ellipse cx="18" cy="22" rx="4.5" ry="2.5" fill="#8b949e" />
      {/* Username */}
      <rect x="30" y="12" width="28" height="3.5" rx="1.5" fill="#ffffff" opacity="0.9" />
      {/* Score */}
      <rect x="30" y="19" width="14" height="2.5" rx="1" fill="#ffd700" opacity="0.7" />
      {/* Anime lines */}
      <rect x="10" y="32" width="38" height="2.5" rx="1" fill="#e0e0e0" opacity="0.4" />
      <rect x="10" y="37" width="32" height="2.5" rx="1" fill="#e0e0e0" opacity="0.3" />
      <rect x="10" y="42" width="35" height="2.5" rx="1" fill="#e0e0e0" opacity="0.2" />
      {/* BG image hint */}
      <rect x="60" y="0" width="40" height="50" rx="0" fill="#8b949e" opacity="0.08" />
      <rect x="70" y="10" width="20" height="30" rx="2" fill="#8b949e" opacity="0.1" />
    </svg>
  );
}

/* ─── MEDIUM ─── Larger avatar, two-column layout */
function MediumCardSvg() {
  return (
    <svg viewBox="0 0 100 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="md-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
      </defs>
      <rect width="100" height="50" rx="4" fill="url(#md-bg)" />
      {/* Avatar */}
      <circle cx="16" cy="14" r="9" fill="#2a2a4a" stroke="#e0e0e0" strokeWidth="0.8" />
      <circle cx="16" cy="12" r="3.5" fill="#8b949e" />
      <ellipse cx="16" cy="19" rx="5" ry="3" fill="#8b949e" />
      {/* Username + score */}
      <rect x="30" y="8" width="25" height="3.5" rx="1.5" fill="#ffffff" opacity="0.9" />
      <rect x="30" y="14" width="12" height="2.5" rx="1" fill="#ffd700" opacity="0.7" />
      {/* Stats row */}
      <rect x="30" y="20" width="8" height="2" rx="1" fill="#e0e0e0" opacity="0.3" />
      <rect x="41" y="20" width="8" height="2" rx="1" fill="#e0e0e0" opacity="0.3" />
      <rect x="52" y="20" width="8" height="2" rx="1" fill="#e0e0e0" opacity="0.3" />
      {/* Left column - Animes */}
      <rect x="8" y="28" width="18" height="2" rx="1" fill="#e0e0e0" opacity="0.5" />
      <rect x="8" y="33" width="34" height="2" rx="1" fill="#e0e0e0" opacity="0.3" />
      <rect x="8" y="37" width="30" height="2" rx="1" fill="#e0e0e0" opacity="0.25" />
      <rect x="8" y="41" width="32" height="2" rx="1" fill="#e0e0e0" opacity="0.2" />
      {/* Right column - Mangas */}
      <rect x="54" y="28" width="18" height="2" rx="1" fill="#e0e0e0" opacity="0.5" />
      <rect x="54" y="33" width="34" height="2" rx="1" fill="#e0e0e0" opacity="0.3" />
      <rect x="54" y="37" width="30" height="2" rx="1" fill="#e0e0e0" opacity="0.25" />
      <rect x="54" y="41" width="32" height="2" rx="1" fill="#e0e0e0" opacity="0.2" />
      {/* BG image hint */}
      <rect x="68" y="0" width="32" height="25" rx="0" fill="#8b949e" opacity="0.06" />
    </svg>
  );
}

/* ─── LARGE ─── Large avatar, cover thumbnails */
function LargeCardSvg() {
  return (
    <svg viewBox="0 0 80 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
      </defs>
      <rect width="80" height="50" rx="4" fill="url(#lg-bg)" />
      {/* Avatar */}
      <circle cx="14" cy="13" r="8" fill="#2a2a4a" stroke="#e0e0e0" strokeWidth="0.8" />
      <circle cx="14" cy="11" r="3" fill="#8b949e" />
      <ellipse cx="14" cy="17" rx="4.5" ry="2.5" fill="#8b949e" />
      {/* Username */}
      <rect x="26" y="8" width="22" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
      <rect x="26" y="14" width="10" height="2" rx="1" fill="#ffd700" opacity="0.7" />
      {/* Cover thumbnails - animes */}
      <rect x="6" y="26" width="10" height="14" rx="1.5" fill="#4a3f6b" opacity="0.6" />
      <rect x="18" y="26" width="10" height="14" rx="1.5" fill="#3f5b6b" opacity="0.6" />
      <rect x="30" y="26" width="10" height="14" rx="1.5" fill="#6b3f4a" opacity="0.6" />
      {/* Cover thumbnails - mangas */}
      <rect x="46" y="26" width="10" height="14" rx="1.5" fill="#3f6b5b" opacity="0.6" />
      <rect x="58" y="26" width="10" height="14" rx="1.5" fill="#6b5b3f" opacity="0.6" />
      <rect x="70" y="26" width="10" height="14" rx="1.5" fill="#5b3f6b" opacity="0.6" />
      {/* Section headers */}
      <rect x="6" y="23" width="14" height="2" rx="1" fill="#ffffff" opacity="0.5" />
      <rect x="46" y="23" width="14" height="2" rx="1" fill="#ffffff" opacity="0.5" />
      {/* Lines on covers */}
      <rect x="7" y="37" width="8" height="1.5" rx="0.5" fill="#e0e0e0" opacity="0.3" />
      <rect x="19" y="37" width="8" height="1.5" rx="0.5" fill="#e0e0e0" opacity="0.3" />
      <rect x="31" y="37" width="8" height="1.5" rx="0.5" fill="#e0e0e0" opacity="0.3" />
    </svg>
  );
}

/* ─── SUMMARY ─── Detailed stats, genre tags, achievements */
function SummaryCardSvg() {
  return (
    <svg viewBox="0 0 80 60" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="su-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
      </defs>
      <rect width="80" height="60" rx="4" fill="url(#su-bg)" />
      {/* Avatar */}
      <circle cx="12" cy="10" r="6" fill="#2a2a4a" stroke="#f0f6fc" strokeWidth="0.6" />
      <circle cx="12" cy="8.5" r="2.5" fill="#8b949e" />
      <ellipse cx="12" cy="13" rx="3.5" ry="2" fill="#8b949e" />
      {/* Username */}
      <rect x="22" y="7" width="20" height="3" rx="1.5" fill="#f0f6fc" opacity="0.9" />
      <rect x="22" y="12" width="10" height="2" rx="1" fill="#ffd700" opacity="0.7" />
      {/* Main stats */}
      <rect x="52" y="5" width="10" height="6" rx="1" fill="#58a6ff" opacity="0.2" />
      <rect x="64" y="5" width="10" height="6" rx="1" fill="#58a6ff" opacity="0.2" />
      <rect x="54" y="7" width="6" height="2" rx="1" fill="#58a6ff" opacity="0.5" />
      <rect x="66" y="7" width="6" height="2" rx="1" fill="#58a6ff" opacity="0.5" />
      {/* Detail stats colored */}
      <rect x="5" y="20" width="16" height="3" rx="1.5" fill="#7c3aed" opacity="0.4" />
      <rect x="23" y="20" width="16" height="3" rx="1.5" fill="#059669" opacity="0.4" />
      <rect x="41" y="20" width="16" height="3" rx="1.5" fill="#dc2626" opacity="0.4" />
      <rect x="59" y="20" width="16" height="3" rx="1.5" fill="#ea580c" opacity="0.4" />
      {/* Genre tags */}
      <rect x="5" y="27" width="12" height="3" rx="1.5" fill="#58a6ff" opacity="0.2" />
      <rect x="19" y="27" width="10" height="3" rx="1.5" fill="#58a6ff" opacity="0.2" />
      <rect x="31" y="27" width="14" height="3" rx="1.5" fill="#58a6ff" opacity="0.2" />
      <rect x="47" y="27" width="11" height="3" rx="1.5" fill="#58a6ff" opacity="0.2" />
      {/* Anime list */}
      <rect x="5" y="34" width="14" height="2" rx="1" fill="#f0f6fc" opacity="0.4" />
      <rect x="5" y="38" width="32" height="2" rx="1" fill="#e0e0e0" opacity="0.25" />
      <rect x="5" y="42" width="28" height="2" rx="1" fill="#e0e0e0" opacity="0.2" />
      <rect x="5" y="46" width="30" height="2" rx="1" fill="#e0e0e0" opacity="0.15" />
      {/* Manga list */}
      <rect x="42" y="34" width="14" height="2" rx="1" fill="#f0f6fc" opacity="0.4" />
      <rect x="42" y="38" width="32" height="2" rx="1" fill="#e0e0e0" opacity="0.25" />
      <rect x="42" y="42" width="28" height="2" rx="1" fill="#e0e0e0" opacity="0.2" />
      <rect x="42" y="46" width="30" height="2" rx="1" fill="#e0e0e0" opacity="0.15" />
      {/* Achievements */}
      <rect x="5" y="52" width="8" height="3" rx="1.5" fill="#ffd700" opacity="0.25" />
      <rect x="15" y="52" width="8" height="3" rx="1.5" fill="#ffd700" opacity="0.25" />
      <rect x="25" y="52" width="8" height="3" rx="1.5" fill="#ffd700" opacity="0.25" />
    </svg>
  );
}

/* ─── NEON ─── Cyberpunk: black bg, cyan/magenta glows, grid */
function NeonCardSvg() {
  return (
    <svg viewBox="0 0 100 58" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="neon-cyan" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-magenta" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Deep black background */}
      <rect width="100" height="58" rx="4" fill="#0a0a0f" />
      {/* Subtle grid */}
      <line x1="0" y1="15" x2="100" y2="15" stroke="#00ffff" strokeWidth="0.15" opacity="0.15" />
      <line x1="0" y1="30" x2="100" y2="30" stroke="#00ffff" strokeWidth="0.15" opacity="0.15" />
      <line x1="0" y1="45" x2="100" y2="45" stroke="#00ffff" strokeWidth="0.15" opacity="0.15" />
      <line x1="25" y1="0" x2="25" y2="58" stroke="#00ffff" strokeWidth="0.15" opacity="0.15" />
      <line x1="50" y1="0" x2="50" y2="58" stroke="#00ffff" strokeWidth="0.15" opacity="0.15" />
      <line x1="75" y1="0" x2="75" y2="58" stroke="#00ffff" strokeWidth="0.15" opacity="0.15" />
      {/* Cyan border glow */}
      <rect x="1.5" y="1.5" width="97" height="55" rx="3" fill="none" stroke="#00ffff" strokeWidth="0.8" filter="url(#neon-cyan)" opacity="0.7" />
      {/* Avatar with cyan glow */}
      <circle cx="16" cy="16" r="8" fill="#0a0a0f" stroke="#00ffff" strokeWidth="0.8" filter="url(#neon-cyan)" opacity="0.8" />
      <circle cx="16" cy="14" r="3" fill="#00ffff" opacity="0.3" />
      <ellipse cx="16" cy="20" rx="4.5" ry="2.5" fill="#00ffff" opacity="0.2" />
      {/* Username in cyan */}
      <rect x="28" y="11" width="26" height="3.5" rx="1.5" fill="#00ffff" filter="url(#neon-cyan)" opacity="0.8" />
      {/* Stats in magenta */}
      <rect x="28" y="18" width="14" height="2.5" rx="1" fill="#ff00ff" filter="url(#neon-magenta)" opacity="0.6" />
      {/* Gradient separator */}
      <line x1="8" y1="28" x2="92" y2="28" stroke="url(#neon-sep)" strokeWidth="0.6" />
      <linearGradient id="neon-sep" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#00ffff" />
        <stop offset="100%" stopColor="#ff00ff" />
      </linearGradient>
      {/* Anime section - cyan */}
      <rect x="8" y="32" width="16" height="2" rx="1" fill="#00ffff" opacity="0.6" />
      <rect x="8" y="36" width="34" height="2" rx="1" fill="#e0e0e0" opacity="0.25" />
      <rect x="8" y="40" width="30" height="2" rx="1" fill="#e0e0e0" opacity="0.2" />
      <rect x="8" y="44" width="32" height="2" rx="1" fill="#e0e0e0" opacity="0.15" />
      {/* Manga section - magenta */}
      <rect x="54" y="32" width="16" height="2" rx="1" fill="#ff00ff" opacity="0.6" />
      <rect x="54" y="36" width="34" height="2" rx="1" fill="#e0e0e0" opacity="0.25" />
      <rect x="54" y="40" width="30" height="2" rx="1" fill="#e0e0e0" opacity="0.2" />
      <rect x="54" y="44" width="32" height="2" rx="1" fill="#e0e0e0" opacity="0.15" />
      {/* Score in gold */}
      <rect x="60" y="11" width="10" height="3" rx="1.5" fill="#ffdd00" opacity="0.5" />
      {/* Genre tags with cyan border */}
      <rect x="8" y="50" width="14" height="3" rx="1.5" fill="none" stroke="#00ffff" strokeWidth="0.4" opacity="0.4" />
      <rect x="24" y="50" width="12" height="3" rx="1.5" fill="none" stroke="#00ffff" strokeWidth="0.4" opacity="0.4" />
      <rect x="38" y="50" width="16" height="3" rx="1.5" fill="none" stroke="#00ffff" strokeWidth="0.4" opacity="0.4" />
    </svg>
  );
}

/* ─── MINIMAL ─── Light elegant: cream bg, purple accent bar, pills */
function MinimalCardSvg() {
  return (
    <svg viewBox="0 0 100 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="min-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {/* Light background */}
      <rect width="100" height="50" rx="4" fill="#fafaf9" />
      <rect width="100" height="50" rx="4" fill="none" stroke="#e7e5e4" strokeWidth="0.8" />
      {/* Top accent gradient bar */}
      <rect x="0" y="0" width="100" height="3" rx="4" fill="url(#min-accent)" />
      <rect x="0" y="2" width="100" height="1.5" fill="url(#min-accent)" />
      {/* Avatar with shadow hint */}
      <circle cx="16" cy="16" r="7" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="0.8" />
      <circle cx="16" cy="14.5" r="2.8" fill="#a8a29e" opacity="0.5" />
      <ellipse cx="16" cy="19.5" rx="4" ry="2.2" fill="#a8a29e" opacity="0.4" />
      {/* Username - dark */}
      <rect x="28" y="11" width="24" height="3.5" rx="1.5" fill="#1c1917" opacity="0.8" />
      {/* Subtitle */}
      <rect x="28" y="17" width="16" height="2" rx="1" fill="#78716c" opacity="0.5" />
      {/* Score badge */}
      <rect x="70" y="10" width="18" height="6" rx="3" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="0.5" />
      <rect x="74" y="12" width="10" height="2" rx="1" fill="#7c3aed" opacity="0.6" />
      {/* Stat pills */}
      <rect x="8" y="26" width="18" height="4" rx="2" fill="#ede9fe" />
      <rect x="10" y="27.5" width="10" height="1.5" rx="0.75" fill="#7c3aed" opacity="0.5" />
      <rect x="28" y="26" width="18" height="4" rx="2" fill="#dcfce7" />
      <rect x="30" y="27.5" width="10" height="1.5" rx="0.75" fill="#16a34a" opacity="0.5" />
      <rect x="48" y="26" width="18" height="4" rx="2" fill="#fee2e2" />
      <rect x="50" y="27.5" width="10" height="1.5" rx="0.75" fill="#dc2626" opacity="0.5" />
      <rect x="68" y="26" width="18" height="4" rx="2" fill="#fef3c7" />
      <rect x="70" y="27.5" width="10" height="1.5" rx="0.75" fill="#d97706" opacity="0.5" />
      {/* Anime list - left */}
      <circle cx="11" cy="36" r="1.2" fill="#6366f1" opacity="0.6" />
      <rect x="14" y="35" width="28" height="2" rx="1" fill="#57534e" opacity="0.35" />
      <circle cx="11" cy="41" r="1.2" fill="#6366f1" opacity="0.6" />
      <rect x="14" y="40" width="24" height="2" rx="1" fill="#57534e" opacity="0.25" />
      <circle cx="11" cy="46" r="1.2" fill="#6366f1" opacity="0.6" />
      <rect x="14" y="45" width="26" height="2" rx="1" fill="#57534e" opacity="0.2" />
      {/* Manga list - right */}
      <circle cx="55" cy="36" r="1.2" fill="#8b5cf6" opacity="0.6" />
      <rect x="58" y="35" width="28" height="2" rx="1" fill="#57534e" opacity="0.35" />
      <circle cx="55" cy="41" r="1.2" fill="#8b5cf6" opacity="0.6" />
      <rect x="58" y="40" width="24" height="2" rx="1" fill="#57534e" opacity="0.25" />
      <circle cx="55" cy="46" r="1.2" fill="#8b5cf6" opacity="0.6" />
      <rect x="58" y="45" width="26" height="2" rx="1" fill="#57534e" opacity="0.2" />
    </svg>
  );
}

/* ─── GLASSMORPHISM ─── Purple gradient, frosted glass panels, circles */
function GlassCardSvg() {
  return (
    <svg viewBox="0 0 88 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gl-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="35%" stopColor="#312e81" />
          <stop offset="70%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>
      </defs>
      {/* Gradient background */}
      <rect width="88" height="50" rx="4" fill="url(#gl-bg)" />
      {/* Decorative circles */}
      <circle cx="70" cy="10" r="14" fill="#8b5cf6" opacity="0.1" />
      <circle cx="15" cy="42" r="10" fill="#ec4899" opacity="0.08" />
      <circle cx="80" cy="40" r="8" fill="#3b82f6" opacity="0.06" />
      {/* Main glass panel */}
      <rect x="6" y="6" width="76" height="38" rx="6" fill="#ffffff" opacity="0.07" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.18" />
      {/* Avatar glow */}
      <circle cx="18" cy="16" r="7" fill="#ffffff" opacity="0.05" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.25" />
      <circle cx="18" cy="14.5" r="2.8" fill="#ffffff" opacity="0.2" />
      <ellipse cx="18" cy="19" rx="4" ry="2.2" fill="#ffffff" opacity="0.15" />
      {/* Username - white */}
      <rect x="29" y="12" width="22" height="3" rx="1.5" fill="#ffffff" opacity="0.85" />
      {/* Subtitle */}
      <rect x="29" y="17.5" width="14" height="2" rx="1" fill="#ffffff" opacity="0.4" />
      {/* Score */}
      <rect x="62" y="11" width="14" height="6" rx="3" fill="#ffffff" opacity="0.08" stroke="#ffffff" strokeWidth="0.4" strokeOpacity="0.2" />
      <rect x="65" y="13" width="8" height="2" rx="1" fill="#fbbf24" opacity="0.7" />
      {/* Separator */}
      <line x1="12" y1="26" x2="76" y2="26" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.15" />
      {/* Stat mini cards */}
      <rect x="10" y="29" width="15" height="6" rx="2" fill="#ffffff" opacity="0.05" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.1" />
      <rect x="12" y="30.5" width="4" height="1.5" rx="0.75" fill="#a78bfa" opacity="0.7" />
      <rect x="12" y="33" width="8" height="1" rx="0.5" fill="#ffffff" opacity="0.3" />

      <rect x="27" y="29" width="15" height="6" rx="2" fill="#ffffff" opacity="0.05" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.1" />
      <rect x="29" y="30.5" width="4" height="1.5" rx="0.75" fill="#34d399" opacity="0.7" />
      <rect x="29" y="33" width="8" height="1" rx="0.5" fill="#ffffff" opacity="0.3" />

      <rect x="44" y="29" width="15" height="6" rx="2" fill="#ffffff" opacity="0.05" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.1" />
      <rect x="46" y="30.5" width="4" height="1.5" rx="0.75" fill="#fb7185" opacity="0.7" />
      <rect x="46" y="33" width="8" height="1" rx="0.5" fill="#ffffff" opacity="0.3" />

      <rect x="61" y="29" width="15" height="6" rx="2" fill="#ffffff" opacity="0.05" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.1" />
      <rect x="63" y="30.5" width="4" height="1.5" rx="0.75" fill="#fbbf24" opacity="0.7" />
      <rect x="63" y="33" width="8" height="1" rx="0.5" fill="#ffffff" opacity="0.3" />
      {/* Bottom content lines */}
      <rect x="10" y="39" width="2" height="4" rx="1" fill="#a78bfa" opacity="0.5" />
      <rect x="14" y="40" width="20" height="1.5" rx="0.75" fill="#ffffff" opacity="0.25" />
      <rect x="40" y="39" width="2" height="4" rx="1" fill="#fb7185" opacity="0.5" />
      <rect x="44" y="40" width="20" height="1.5" rx="0.75" fill="#ffffff" opacity="0.25" />
    </svg>
  );
}
