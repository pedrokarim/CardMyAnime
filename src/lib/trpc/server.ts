import { appRouter } from "@/server/trpc";
import { createTRPCContext } from "@/lib/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const api = appRouter.createCaller({
  session: null,
});
