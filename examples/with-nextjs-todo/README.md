# TiDB Cloud Next.js Todo Example

A minimalist todo application built with Next.js and TiDB Cloud, demonstrating how to build a full-stack application with serverless database capabilities using Drizzle ORM.

## Prerequisites

1. Sign up for a [TiDB Cloud](https://tidbcloud.com/) account
2. Create a Serverless Tier cluster (free)
3. Get your connection details from the TiDB Cloud console

## Getting Started

### 1. Configure Database Connection

Create a `.env` file in the root directory with your TiDB Cloud connection string:

```env
DATABASE_URL=mysql://{user}:{password}@{host}:{port}/{database}
```

The connection string can be found in your TiDB Cloud console under the "Connect" button for your cluster. Make sure to:
- Include your database name at the end of the URL
- URL encode any special characters in the password

### 2. Database Schema

The project uses Drizzle ORM with the following schema:

```typescript
import { mysqlTable, int, text, boolean, timestamp } from "drizzle-orm/mysql-core";

export const todo = mysqlTable("todo", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

To create the tables, run the following SQL in the SQL Editor of your TiDB Cloud web console, make sure to replace <your_database_name> with your own database name:

```sql
use <your_database_name>;

CREATE TABLE `todo` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` text NOT NULL,
  `completed` boolean NOT NULL DEFAULT false,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now()),
  CONSTRAINT `todo_id` PRIMARY KEY(`id`)
);
```

### 3. Install Dependencies and Run

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to see your todo app in action.

## Features

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Server-side rendering with Next.js
- Serverless database with TiDB Cloud
- Type-safe database queries with Drizzle ORM
- Optimistic UI updates

## Project Structure

```
├── src/
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts    # Database connection
│   │   │   └── schema.ts   # Drizzle schema
│   ├── components/         # React components
│   └── pages/              # Next.js pages
└── .env                    # Environment variables
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your `DATABASE_URL` environment variable in Vercel project settings
4. Deploy!

## Learn More

- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)

## License

This project is licensed under the MIT License.
