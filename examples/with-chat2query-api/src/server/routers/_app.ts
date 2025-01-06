import { z } from "zod";
import { procedure, router } from "../trpc";
import { Chat2Query } from "../chat2query";

let c2q = new Chat2Query({
  publicKey: process.env.CHAT2QUERY_PUBLIC_KEY!,
  privateKey: process.env.CHAT2QUERY_PRIVATE_KEY!,
  baseUrl: process.env.CHAT2QUERY_BASE_URL!,
  clusterId: process.env.CHAT2QUERY_CLUSTER_ID!,
  database: process.env.CHAT2QUERY_DATABASE!,
});

export const appRouter = router({
  getDataSummary: procedure
    .input(
      z.union([
        z.object({
          clusterId: z.string(),
          database: z.string(),
          publicKey: z.string(),
          privateKey: z.string(),
          baseUrl: z.string(),
        }),
        z.void(),
      ]),
    )
    .query(async ({ input }) => {
      if (input) {
        const { clusterId, database, publicKey, privateKey, baseUrl } = input;

        c2q = new Chat2Query({
          baseUrl,
          publicKey,
          privateKey,
          clusterId,
          database,
        });
      }

      return await c2q.getDataSummary();
    }),
  ask: procedure
    .input(
      z.union([
        z.object({
          clusterId: z.string(),
          database: z.string(),
          publicKey: z.string(),
          privateKey: z.string(),
          baseUrl: z.string(),
          question: z.string(),
        }),
        z.object({
          question: z.string(),
        }),
      ]),
    )
    .mutation(async ({ input }) => {
      if ("clusterId" in input) {
        const { clusterId, database, publicKey, privateKey, baseUrl } = input;
        c2q = new Chat2Query({
          baseUrl,
          publicKey,
          privateKey,
          clusterId,
          database,
        });
      }

      return await c2q.ask(input.question);
    }),
});

export type AppRouter = typeof appRouter;
