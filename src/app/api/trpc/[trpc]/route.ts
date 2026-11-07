import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createHTTPTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createHTTPTRPCContext({ req }),
  });
export { handler as GET, handler as POST };
