"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { MotionConfig } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import superjson from "superjson";
import { AscenciaSessionProvider } from "@/lib/ascencia/client";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <AscenciaSessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {/* reducedMotion="user" : framer-motion neutralise de lui-même les
                animations de transform/layout quand l'OS demande un mouvement
                réduit, sans qu'on ait à conditionner chaque variante. */}
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </AscenciaSessionProvider>
  );
}
