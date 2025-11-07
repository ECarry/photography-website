import { db } from "@/db";
import { cache } from "react";
import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import { getSession } from "@/modules/auth/lib/get-session";

export const createTRPCContext = cache(async () => {
  return { db };
});

type Context = {
  db: typeof db;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    const session = await getSession();

    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return next({
      ctx: {
        ...ctx,
        auth: session.user,
      },
    });
  })
);
