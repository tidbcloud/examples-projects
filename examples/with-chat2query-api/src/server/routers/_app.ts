import { z } from "zod";
import { Chat2Query } from "../chat2query";
import { procedure, router } from "../trpc";

function createChat2Query() {
  return new Chat2Query({
    publicKey: process.env.CHAT2QUERY_PUBLIC_KEY!,
    privateKey: process.env.CHAT2QUERY_PRIVATE_KEY!,
    baseUrl: process.env.CHAT2QUERY_BASE_URL!,
    clusterId: process.env.CHAT2QUERY_CLUSTER_ID!,
    database: process.env.CHAT2QUERY_DATABASE!,
  });
}

export const appRouter = router({
  getDataSummary: procedure
    .input(z.void())
    .query(() => createChat2Query().getDataSummary()),
  ask: procedure
    .input(z.strictObject({ question: z.string() }))
    .mutation(({ input }) => createChat2Query().ask(input.question)),
});

export type AppRouter = typeof appRouter;
