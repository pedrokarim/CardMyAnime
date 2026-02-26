import { auth } from "@/lib/auth";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";
import {
  cronEmitter,
  getSchedulerStatus,
  getNextRunTime,
  ensureSchedulerStarted,
} from "@/lib/services/cron";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Non autorisé", { status: 401 });
  }

  ensureSchedulerStarted();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      function send(event: string, data: unknown) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // stream closed
        }
      }

      // --- Periodic status tick (every 3s) ---
      async function sendStatusTick() {
        if (closed) return;
        try {
          await ensurePrismaConnection();
          const jobs = await prisma.cronJob.findMany({
            orderBy: { createdAt: "desc" },
          });

          const jobsWithNextRun = jobs.map((job) => ({
            ...job,
            nextRunAt: job.enabled
              ? getNextRunTime(job.schedule)?.toISOString() ?? null
              : null,
          }));

          send("status", {
            scheduler: getSchedulerStatus(),
            jobs: jobsWithNextRun,
            serverTime: new Date().toISOString(),
          });
        } catch (error) {
          send("error", {
            message:
              error instanceof Error ? error.message : "Erreur interne",
          });
        }
      }

      // Send initial status immediately
      void sendStatusTick();

      const statusInterval = setInterval(() => {
        void sendStatusTick();
      }, 3000);

      // --- Job events from the cron emitter ---
      function onJobStart(data: unknown) {
        send("job:start", data);
      }
      function onJobOutput(data: unknown) {
        send("job:output", data);
      }
      function onJobEnd(data: unknown) {
        send("job:end", data);
      }

      cronEmitter.on("job:start", onJobStart);
      cronEmitter.on("job:output", onJobOutput);
      cronEmitter.on("job:end", onJobEnd);

      // --- Cleanup on close ---
      controller.enqueue(encoder.encode(": connected\n\n"));

      // Store cleanup for cancel()
      (controller as any).__cleanup = () => {
        closed = true;
        clearInterval(statusInterval);
        cronEmitter.off("job:start", onJobStart);
        cronEmitter.off("job:output", onJobOutput);
        cronEmitter.off("job:end", onJobEnd);
      };
    },
    cancel(controller) {
      (controller as any).__cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
