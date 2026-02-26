export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startCronScheduler } = await import("./src/lib/services/cron");
  startCronScheduler();
}
