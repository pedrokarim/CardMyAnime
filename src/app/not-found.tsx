"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion as m } from "framer-motion";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center space-y-8 px-6">
        {/* Animated 404 Number */}
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-[150px] font-bold text-primary/10">404</h1>
          <m.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <AlertTriangle className="h-24 w-24 text-primary" />
          </m.div>
        </m.div>

        {/* Error Message */}
        <m.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold tracking-tight">
            Oups ! Page introuvable
          </h2>
          <p className="text-muted-foreground max-w-[500px] mx-auto">
            Désolé, la page que vous recherchez semble avoir disparu dans le
            néant numérique. Peut-être a-t-elle pris des vacances ?
          </p>
        </m.div>

        {/* Action Button */}
        <m.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </m.div>
      </div>
    </div>
  );
}
