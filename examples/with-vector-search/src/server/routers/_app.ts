import { z } from "zod";
import { connect } from "@tidbcloud/serverless";
import { procedure, router } from "../trpc";

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),

  testConnection: procedure
    .input(
      z.object({
        conn: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const url = atob(opts.input.conn);
      const conn = connect({ url });

      try {
        const versionResult = (await conn.execute(
          "SELECT VERSION() as version;",
        )) as { version: string }[];

        return {
          success: true,
          data: versionResult[0].version,
          error: null,
        };
      } catch (e) {
        return {
          success: false,
          data: null,
          error: (e as Error).message,
        };
      }
    }),

  testSegmenter: procedure.mutation(async () => {
    const result = await fetch(`https://segment.jina.ai`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          "TiDB Cloud is a fully-managed Database-as-a-Service (DBaaS) that brings TiDB, an open-source Hybrid Transactional and Analytical Processing (HTAP) database, to your cloud.\nTiDB Cloud offers an easy way to deploy and manage databases to let you focus on your applications, not the complexities of the databases.\nYou can create TiDB Cloud clusters to quickly build mission-critical applications on Google Cloud and Amazon Web Services (AWS).",
        return_tokens: true,
        return_chunks: true,
        max_chunk_length: 1000,
      }),
    });

    const data = (await result.json()) as JinaSegmenterResponse;

    console.log(data);

    return {
      success: true,
      data: {
        num_tokens: data.num_tokens,
        num_chunks: data.num_chunks,
        chunk_positions: data.chunk_positions,
        chunks: data.chunks,
      },
    };
  }),

  indexingUrl: procedure
    .input(
      z.object({
        url: z.string(),
        db: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const url = opts.input.url;
      const db = opts.input.db;
      const conn = connect({ url: atob(db) });

      // check if the url is already indexed
      const res = (await conn.execute(
        `SELECT COUNT(*) as count FROM documents WHERE url = ?`,
        [url],
      )) as { count: string }[];
      console.log(res);
      const count = parseInt(res[0].count);
      if (count > 0) {
        return {
          success: true,
          error: "URL already indexed",
        };
      }

      const result = await fetch(`https://r.jina.ai/${url}`);
      const content = await result.text();
      console.log(content);

      const segmentsResult = await fetch(`https://segment.jina.ai`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          return_tokens: true,
          return_chunks: true,
          max_chunk_length: 1000,
        }),
      });

      const segmentsData =
        (await segmentsResult.json()) as JinaSegmenterResponse;

      const embeddingsResult = await fetch(
        "https://api.jina.ai/v1/embeddings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.JINA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "jina-embeddings-v3",
            task: "retrieval.passage",
            late_chunking: true,
            dimensions: 768,
            embedding_type: "float",
            input: segmentsData.chunks,
          }),
        },
      );

      const embeddingsData =
        (await embeddingsResult.json()) as JinaEmbeddingsResponse;

      const tx = await conn.begin();
      await Promise.all(
        embeddingsData.data.map((embedding) =>
          tx.execute(
            `INSERT INTO documents (url, content, embedding) VALUES (?, ?, ?)`,
            [
              url,
              segmentsData.chunks[embedding.index],
              JSON.stringify(embedding.embedding),
            ],
          ),
        ),
      );
      await tx.commit();

      return {
        success: true,
      };
    }),

  queryDocuments: procedure
    .input(
      z.object({
        query: z.string(),
        db: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const query = opts.input.query;
      const db = opts.input.db;
      const conn = connect({ url: atob(db) });

      const embeddingsResult = await fetch(
        "https://api.jina.ai/v1/embeddings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.JINA_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "jina-embeddings-v3",
            task: "retrieval.query",
            dimensions: 768,
            embedding_type: "float",
            input: [query],
          }),
        },
      );

      const embeddingsData =
        (await embeddingsResult.json()) as JinaEmbeddingsResponse;

      console.log(embeddingsData);

      const queryEmbedding = embeddingsData.data[0].embedding;

      const result = await conn.execute(
        `SELECT url, content, vec_cosine_distance(embedding, ?) AS distance FROM documents ORDER BY distance LIMIT 50`,
        [JSON.stringify(queryEmbedding)],
      );

      console.log(result);

      return {
        success: true,
        data: result as {
          url: string;
          content: string;
          distance: number;
        }[],
      };
    }),

  reranker: procedure
    .input(
      z.object({
        query: z.string(),
        documents: z.array(z.string()),
      }),
    )
    .mutation(async (opts) => {
      const query = opts.input.query;
      const documents = opts.input.documents;

      const result = await fetch(`https://api.jina.ai/v1/rerank`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "jina-reranker-v2-base-multilingual",
          query,
          top_n: 5,
          documents,
        }),
      });

      const data = (await result.json()) as JinaRerankerResponse;

      return {
        success: true,
        data: data.results,
      };
    }),
});

interface JinaSegmenterResponse {
  num_tokens: number;
  tokenizer: string;
  usage: {
    tokens: number;
  };
  num_chunks: number;
  chunk_positions: [number, number][];
  chunks: string[];
}

interface JinaEmbeddingsResponse {
  model: string;
  object: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
  data: {
    object: string;
    index: number;
    embedding: number[];
  }[];
}

interface JinaRerankerResponse {
  model: string;
  usage: {
    total_tokens: number;
  };
  results: {
    index: number;
    document: {
      text: string;
    };
    relevance_score: number;
  }[];
}

// export type definition of API
export type AppRouter = typeof appRouter;
