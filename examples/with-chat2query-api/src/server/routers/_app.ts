import { z } from "zod";
import { procedure, router } from "../trpc";
import { Chat2Query, DataSummary, JobResult } from "../chat2query";

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

      // return {
      //   code: 200,
      //   msg: "",
      //   result: {
      //     job_id: "123",
      //     ended_at: 123,
      //     status: "done",
      //     reason: "",
      //     result: {
      //       cluster_id: "cls_12345abcde",
      //       data_summary_id: 987654,
      //       database: "ecommerce_db",
      //       default: true,
      //       status: "done",
      //       description: {
      //         system:
      //           "E-commerce database containing customer, order, and product information",
      //         user: "Main production database for online store operations",
      //       },
      //       keywords: [
      //         "ecommerce",
      //         "orders",
      //         "customers",
      //         "products",
      //         "inventory",
      //       ],
      //       relationships: {
      //         orders: [
      //           {
      //             referenced_table: "customers",
      //             referenced_table_column: "customer_id",
      //             referencing_table: "orders",
      //             referencing_table_column: "customer_id",
      //           },
      //           {
      //             referenced_table: "products",
      //             referenced_table_column: "product_id",
      //             referencing_table: "order_items",
      //             referencing_table_column: "product_id",
      //           },
      //         ],
      //       },
      //       summary:
      //         "Database contains 4 main tables: customers, orders, products, and order_items. Tracks customer information, order history, and product inventory.",
      //       tables: {
      //         customers: {
      //           columns: {
      //             customer_id: {
      //               name: "customer_id",
      //               description: "Unique identifier for customer",
      //             },
      //             email: {
      //               name: "email",
      //               description: "Customer's email address",
      //             },
      //             name: {
      //               name: "name",
      //               description: "Customer's full name",
      //             },
      //           },
      //           description: "Contains customer profile information",
      //           name: "customers",
      //         },
      //         orders: {
      //           columns: {
      //             order_id: {
      //               name: "order_id",
      //               description: "Unique identifier for order",
      //             },
      //             customer_id: {
      //               name: "customer_id",
      //               description: "Reference to customer who placed the order",
      //             },
      //             order_date: {
      //               name: "order_date",
      //               description: "Date when order was placed",
      //             },
      //           },
      //           description: "Stores order header information",
      //           name: "orders",
      //         },
      //       },
      //     },
      //   },
      // } as JobResult<DataSummary>;

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
