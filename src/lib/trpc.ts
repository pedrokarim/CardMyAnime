import { initTRPC } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { ZodError } from "zod";
import superjson from "superjson";

interface CreateContextOptions {
  session: any | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};

// L'API est servie par l'App Router (`fetchRequestHandler`) : le contexte
// doit porter les options de l'adaptateur `fetch`. Typé sur celles du Pages
// Router, il promettait un `res` que l'adaptateur ne fournit jamais.
export const createTRPCContext = async (_opts: FetchCreateContextFnOptions) => {
  // TODO : brancher la session Auth.js le jour où une procédure en aura
  // besoin. `protectedProcedure` rejette tout tant que ceci vaut null.
  const session = null;

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new Error("UNAUTHORIZED");
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
