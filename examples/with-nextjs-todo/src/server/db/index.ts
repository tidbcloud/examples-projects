import { drizzle } from "drizzle-orm/tidb-serverless";
import * as schema from "./schema";

export const db = drizzle({
  connection: { url: process.env.DATABASE_URL },
  schema,
});
