"use client";

import { cn } from "@/lib/utils";
import { Loader2, Heart, Sparkles, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

export interface LoadingProps {
  /** Taille du loader */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  /** Type d'animation */
  variant?:
    | "spinner"
    | "pulse"
    | "dots"
    | "bars"
    | "hearts"
    | "stars"
    | "sparkles";
  /** Message à afficher */
  message?: string;
  /** Couleur du loader */
  color?: "primary" | "secondary" | "accent" | "muted" | "white";
  /** Centrer le loader */
  centered?: boolean;
  /** Prendre toute la hauteur de l'écran */
  fullHeight?: boolean;
  /** Animation personnalisée */
  customAnimation?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
  "2xl": "w-16 h-16",
  "3xl": "w-24 h-24",
  full: "w-32 h-32",
};

const colorClasses = {
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  accent: "text-accent-foreground",
  muted: "text-muted-foreground",
  white: "text-white",
};

const messageSizes = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  full: "text-4xl",
};

export function Loading({
  size = "md",
  variant = "spinner",
  message,
  color = "primary",
  centered = true,
  fullHeight = false,
  customAnimation = false,
  className,
}: LoadingProps) {
  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-3",
    centered && "mx-auto",
    fullHeight && "min-h-screen",
    className
  );

  const iconClasses = cn(
    sizeClasses[size],
    colorClasses[color],
    "animate-spin"
  );

  const messageClasses = cn(
    "text-center font-medium",
    messageSizes[size],
    colorClasses[color]
  );

  const renderSpinner = () => <Loader2 className={iconClasses} />;

  const renderPulse = () => (
    <motion.div
      className={cn("rounded-full bg-current", sizeClasses[size])}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  const renderDots = () => (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "rounded-full bg-current",
            size === "xs" ? "w-1 h-1" : "w-2 h-2"
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const renderBars = () => (
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn("bg-current rounded-sm", {
            "w-1 h-3": size === "xs",
            "w-1 h-4": size === "sm",
            "w-1 h-6": size === "md",
            "w-2 h-8": size === "lg",
            "w-2 h-12": size === "xl",
            "w-3 h-16": size === "2xl",
            "w-4 h-24": size === "3xl",
            "w-6 h-32": size === "full",
          })}
          animate={{
            scaleY: [1, 2, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const renderHearts = () => (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Heart className={cn(iconClasses, "fill-current")} />
    </motion.div>
  );

  const renderStars = () => (
    <div className="relative">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "linear",
          }}
        >
          <Star className={cn(iconClasses, "fill-current")} />
        </motion.div>
      ))}
    </div>
  );

  const renderSparkles = () => (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Sparkles className={iconClasses} />
    </motion.div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "pulse":
        return renderPulse();
      case "dots":
        return renderDots();
      case "bars":
        return renderBars();
      case "hearts":
        return renderHearts();
      case "stars":
        return renderStars();
      case "sparkles":
        return renderSparkles();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClasses}>
      {renderLoader()}
      {message && (
        <motion.p
          className={messageClasses}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// Composants spécialisés pour des cas d'usage courants
export function PageLoading({
  message = "Chargement...",
}: {
  message?: string;
}) {
  return (
    <Loading
      size="2xl"
      variant="spinner"
      message={message}
      fullHeight
      centered
    />
  );
}

export function CardLoading({
  message = "Génération de la carte...",
}: {
  message?: string;
}) {
  return <Loading size="lg" variant="pulse" message={message} centered />;
}

export function ButtonLoading({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  return (
    <Loading
      size={size}
      variant="spinner"
      color="white"
      centered={false}
      fullHeight={false}
    />
  );
}

export function InlineLoading({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  return (
    <Loading size={size} variant="dots" centered={false} fullHeight={false} />
  );
}
