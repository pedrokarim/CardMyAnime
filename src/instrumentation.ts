export async function register() {
  // Skip Edge runtime — only run on Node.js server
  if (process.env.NEXT_RUNTIME === "edge") return;

  try {
    const { startCronScheduler } = await import("@/lib/services/cron");
    startCronScheduler();
  } catch (error) {
    console.error("[Instrumentation] Echec du demarrage du cron scheduler:", error);
  }
}
