# TiDB Cloud Examples

A collection of examples demonstrating how to connect and use TiDB Cloud.

## Getting Started

These examples are built with modern web development tools and practices. Before you begin, make sure you have the following prepared:

### Prerequisites

- Node.js 20.x or later
- pnpm 9.x or later (we use pnpm workspaces to manage multiple examples)
- A [TiDB Cloud](https://tidbcloud.com) account (free tier available, no credit card required)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/tidbcloud/examples-projects.git
```

2. Install dependencies:

```bash
pnpm install
```

3. Each example has its own environment variables that need to be configured. Check the README in each example directory for specific setup instructions.

4. If you only want to clone a single example, you can use the following command:

```bash
npx degit tidbcloud/examples-projects/examples/with-chat2query-api my-example
```

Then cd into that example directory and run `pnpm install`.

You can also replace **with-chat2query-api** with the name of the example you want to clone, for example:

```bash
npx degit tidbcloud/examples-projects/examples/with-data-api my-example
npx degit tidbcloud/examples-projects/examples/with-nextjs-todo my-example
npx degit tidbcloud/examples-projects/examples/with-vector-search my-example
```

Each project requires a `.env` file to be created in the root of the example directory. You can refer to the README in each example directory for more details.

## Examples

### Next.js Todo App

A full-stack todo application built with Next.js, demonstrating how to connect and use TiDB Cloud Serverless with Drizzle ORM.
[Learn more](./examples/with-nextjs-todo/README.md)

### Data Service Dashboard

A dashboard application showcasing TiDB Cloud Data Service for building APIs without backend code.
[Learn more](./examples/with-data-api/README.md)

### Chat2Query Interface

An AI-powered SQL chat interface using TiDB Cloud's Chat2Query API to generate and execute queries.
[Learn more](./examples/with-chat2query-api/README.md)

### Vector Search RAG

A RAG (Retrieval Augmented Generation) application demonstrating TiDB's vector search capabilities.
[Learn more](./examples/with-vector-search/README.md)

## Features Demonstrated

- TiDB Cloud Serverless database connection
- Data Service for serverless APIs
- Chat2Query for natural language SQL queries
- Vector search for semantic search and RAG applications
- TypeScript & Next.js integration
- tRPC for type-safe APIs
- Drizzle ORM for database operations
