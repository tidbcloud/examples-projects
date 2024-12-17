import { z } from "zod";
import { procedure, router } from "../trpc";
import { Filter } from "@/todo/helper";
import { db } from "../db/index";
import { todo } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";

const FilterEnum = z.enum(Object.values(Filter) as [string, ...string[]]);

export const appRouter = router({
  listTodos: procedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        filter: FilterEnum.default("all"),
      }),
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      let whereClause = undefined;
      if (input.filter === Filter.Completed) {
        whereClause = eq(todo.completed, true);
      } else if (input.filter === Filter.Active) {
        whereClause = eq(todo.completed, false);
      }

      const [todos, [{ total }]] = await Promise.all([
        db
          .select()
          .from(todo)
          .where(whereClause)
          .orderBy(desc(todo.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({
            total: sql<number>`cast(count(*) as unsigned)`,
          })
          .from(todo)
          .where(whereClause),
      ]);

      return {
        success: true,
        todos,
        total: Number(total),
      };
    }),

  toggleTodo: procedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(todo)
        .set({
          completed: sql`NOT ${todo.completed}`,
        })
        .where(eq(todo.id, input.id));

      const result = await db
        .select()
        .from(todo)
        .where(eq(todo.id, input.id))
        .then((rows) => rows[0]);

      return {
        success: true,
        todo: result,
      };
    }),

  deleteTodo: procedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.delete(todo).where(eq(todo.id, input.id));

      return { success: true };
    }),

  clearCompleted: procedure.mutation(async () => {
    await db.delete(todo).where(eq(todo.completed, true));
    return { success: true };
  }),

  createTodo: procedure
    .input(
      z.object({
        title: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const [result] = await db
        .insert(todo)
        .values({
          title: input.title,
        })
        .then(() =>
          db.select().from(todo).orderBy(desc(todo.createdAt)).limit(1),
        );

      return {
        success: true,
        todo: result,
      };
    }),

  editTodo: procedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(todo)
        .set({ title: input.title })
        .where(eq(todo.id, input.id));

      const result = await db
        .select()
        .from(todo)
        .where(eq(todo.id, input.id))
        .then((rows) => rows[0]);

      return {
        success: true,
        todo: result,
      };
    }),

  toggleAll: procedure
    .input(
      z.object({
        completed: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.update(todo).set({ completed: input.completed });

      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
