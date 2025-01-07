# TiDB Vector Search Example - How to build your own RAG app

An interactive demo showcasing TiDB's vector search capabilities. This demo allows you to explore and experiment with semantic search functionality powered by TiDB's vector similarity search feature.

## Features

- Interactive vector search demonstration
- Real-time semantic similarity search
- Built-in sample documents and queries
- Custom query testing capability

## How Vector Search Works

1. Document Storage:
   - Each document is converted into a high-dimensional vector (embedding)
   - Both the original content and vector embeddings are stored in TiDB
   - Vector indexes enable efficient similarity search

2. Search Process:
   - Your search query is converted to a vector
   - TiDB finds documents with similar vector representations
   - Results are ranked by similarity score

## Running Locally (Optional)

If you want to run this demo locally:

### Prerequisites

1. Sign up for a [TiDB Cloud](https://tidbcloud.com/) account
2. Create a Serverless Tier cluster (free)
3. Get a [Jina AI API key](https://jina.ai/) for text embeddings

### Setup

1. Clone this repository
2. Create a `.env` file:
```env
JINA_API_KEY=your_jina_api_key
```
3. Install and run:
```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to see the demo locally.

## Learn More

- [TiDB Vector Search Documentation](https://docs.pingcap.com/tidbcloud/vector-search-overview)
- [Integration with TiDB Vector Search](https://docs.pingcap.com/tidbcloud/vector-search-integration-overview)

## License

This project is licensed under the MIT License.
