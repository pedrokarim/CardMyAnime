"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

// Curated anime/manga banner images from AniList CDN (popular series)
const BACKDROP_IMAGES = [
  "https://s4.anilist.co/file/anilistcdn/media/anime/banner/1-OquNCNB6srGe.jpg",    // Cowboy Bebop
  "https://s4.anilist.co/file/anilistcdn/media/anime/banner/5114-q0V5URebphSG.jpg",  // FMA Brotherhood
  "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneG.jpg", // Attack on Titan
  "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeVkolGKdGUV.jpg",  // Your Name
  "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YfZhKBUDDS6L.jpg", // Demon Slayer
  "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg", // Jujutsu Kaisen
];

export function EmptyState() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BACKDROP_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background slideshow with Ken Burns */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <motion.img
            src={BACKDROP_IMAGES[current]}
            alt=""
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1, x: -15, y: -8 }}
            transition={{ duration: 6, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Heavy gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 via-40% to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-transparent to-30%" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 backdrop-blur-sm mb-6">
          <Flame className="w-10 h-10 text-orange-500" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Les tendances arrivent bientôt
        </h2>

        <p className="text-base text-white/60 leading-relaxed mb-6">
          Les tendances de la communauté seront disponibles une fois que
          suffisamment de profils auront été générés et analysés.
        </p>

        <div className="flex items-center justify-center gap-2">
          {BACKDROP_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === current ? "bg-orange-500 w-4" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
