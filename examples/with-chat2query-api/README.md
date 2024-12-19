# TiDB Cloud Chat2Query API Example

This example demonstrates how to build an AI-powered SQL chat interface using TiDB Cloud's Chat2Query API. With less than 100 lines of core code, you can create a ChatGPT-like experience for querying your database.

Try out the [online demo](https://chat2query-example.vercel.app/) to see it in action.

![Demo Screenshot](https://raw.githubusercontent.com/tidbcloud/chat2query-example/main/screenshot.png)

## Getting Started

### Prerequisites

1. Sign up for a [TiDB Cloud](https://tidbcloud.com/) account
2. Create a Serverless Tier cluster (free)
3. Enable Chat2Query feature in your cluster
4. Import sample data into your cluster (optional)

### Configuration

1. Create a Chat2Query app in TiDB Cloud console
2. Copy your credentials and create a `.env` file:

```env
CHAT2QUERY_BASE_URL=https://xxx.data.tidbcloud.com/api/v1beta/app/chat2query-xxxxx/endpoint
CHAT2QUERY_PUBLIC_KEY=your_public_key
CHAT2QUERY_PRIVATE_KEY=your-private-key-uuid
CHAT2QUERY_CLUSTER_ID=your_cluster_id
CHAT2QUERY_DATABASE=your_database_name
```

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see your app.

## Using Chat2Query API

Chat2Query provides a natural language interface to your database. Here's how to use it:

### 1. Generate Data Summary

First, analyze your database to generate a data summary:

```bash
curl --digest --user ${PUBLIC_KEY}:${PRIVATE_KEY} \
  --request POST 'https://<region>.data.tidbcloud.com/api/v1beta/app/chat2query-<ID>/endpoint/v3/dataSummaries' \
  --header 'content-type: application/json' \
  --data-raw '{
    "cluster_id": "your_cluster_id",
    "database": "your_database",
    "description": "Data summary description",
    "reuse": false
}'
```

This returns a `data_summary_id` and `job_id` that you'll need for the next steps.

### 2. Check Analysis Status

Check if the data summary generation is complete:

```bash
curl --digest --user ${PUBLIC_KEY}:${PRIVATE_KEY} \
  --request GET 'https://<region>.data.tidbcloud.com/api/v1beta/app/chat2query-<ID>/endpoint/v2/jobs/{job_id}'
```

Wait until the status is "done" before proceeding.

### 3. Ask Questions

Once the data summary is ready, you can ask questions in natural language:

```bash
curl --digest --user ${PUBLIC_KEY}:${PRIVATE_KEY} \
  --request POST 'https://<region>.data.tidbcloud.com/api/v1beta/app/chat2query-<ID>/endpoint/v3/chat2data' \
  --header 'content-type: application/json' \
  --data-raw '{
    "cluster_id": "your_cluster_id",
    "database": "your_database",
    "question": "Show me total sales by region",
    "sql_generate_mode": "direct"
}'
```

The API will:
1. Convert your question to SQL
2. Execute the query
3. Return both the SQL and results

### Example Response

```json
{
  "result": {
    "clarified_task": "Show total sales by region",
    "sql": "SELECT region, SUM(sales) as total_sales FROM sales GROUP BY region",
    "data": {
      "columns": ["region", "total_sales"],
      "rows": [
        ["North", 1234],
        ["South", 5678]
      ]
    }
  }
}
```

For more details, see the [Chat2Query API documentation](https://docs.pingcap.com/tidbcloud/use-chat2query-api).

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

## Learn More

- [Chat2Query Documentation](https://docs.pingcap.com/tidbcloud/chat2query-overview)
- [Chat2Query API Reference](https://docs.pingcap.com/tidbcloud/use-chat2query-api)
- [TiDB Cloud Documentation](https://docs.pingcap.com/tidbcloud)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)

## License

This project is licensed under the MIT License.
