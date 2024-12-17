import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const todo = mysqlTable("todo", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TodoItem = typeof todo.$inferSelect;
