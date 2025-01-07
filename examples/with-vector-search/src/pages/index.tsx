import localFont from "next/font/local";
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import clsx from "clsx";
import { ollama } from "ollama-ai-provider";
import { streamText } from "ai";
import { Highlight, themes } from "prism-react-renderer";
import Markdown from "react-markdown";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function useChat() {
  const [chatResult, setChatResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const ask = async (prompt: string) => {
    setChatResult("");
    setLoading(true);
    const result = await streamText({
      model: ollama("llama3.2"),
      prompt,
    });
    setLoading(false);
    for await (const chunk of result.textStream) {
      setChatResult((prev) => prev + chunk);
    }
  };

  return { result: chatResult, ask, isPending: loading };
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start lg:max-w-2xl">
      {children}
    </main>
  );
}

function CodeHighlight({
  children,
  language,
}: { children: string; language: string }) {
  return (
    <Highlight
      theme={themes.gruvboxMaterialDark}
      code={children}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre style={style} className={className}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

function stringToColor(str: string): string {
  // Get hash of string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hex
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }

  return color;
}

function Ch1({ onNext }: { onNext: () => void }) {
  const [conn, setConn] = useLocalStorage("conn", "");
  const testConnection = trpc.testConnection.useMutation();
  const { result, ask, isPending } = useChat();
  const [origin, setOrigin] = useState("");

  const onTestConnection = () => {
    if (testConnection.isPending) return;
    testConnection.mutate({ conn: btoa(conn || "") });
  };

  const onTestLLM = async () => {
    await ask("Hello, world!");
  };

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <Section>
      <h2 className="text-xl font-bold">Prepare</h2>
      <form className="flex flex-col gap-4">
        <p>
          You may have heard of <i>Retrieval Augmented Generation or RAG</i>{" "}
          frequently if you're a developer working with generative AI.
        </p>

        <p>
          In simple terms, RAG is about sending your own data (via a retrieval
          tool) as part of the prompt to the large language model. As a result,
          you get output that is more accurate and relevant to your data. This
          technique helps avoid hallucinations and fact-checks the output even
          when the data isn't in the LLM's training datasets.
        </p>

        <p>
          In this tutorial, we will walk through a basic RAG system step by step
          with the help of the vector search capabilities of TiDB Cloud
          Serverless.
        </p>

        <ol className="list-inside list-decimal text-center sm:text-left">
          <li className="mb-4">
            <span>
              {" "}
              First, go to{" "}
              <a
                href="https://tidbcloud.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                TiDB Cloud
              </a>{" "}
              to create a TiDB Serverless cluster and get the connection string.
              TiDB Cloud provides a free database with vector search
              capabilities so we can use it to store all the embeddings.
            </span>
            <label className="input input-bordered flex items-center gap-2 mt-2">
              <input
                type="password"
                className="grow"
                placeholder="your database connection string"
                autoComplete="off"
                value={conn}
                onChange={(e) => setConn(e.target.value)}
              />
            </label>

            <div className="flex gap-2 mt-2">
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={onTestConnection}
              >
                Test connection
              </button>

              <div className="flex items-center gap-2">
                {testConnection.isPending && <span>Loading...</span>}
                {testConnection.data?.success === false && (
                  <span className="text-error">
                    {testConnection.data.error}
                  </span>
                )}
                {testConnection.data?.success === true && (
                  <span className="text-success">
                    Successfully connected to {testConnection.data.data}
                  </span>
                )}
              </div>
            </div>
          </li>

          <li>
            <span>
              Optionally, you can setup{" "}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                ollama
              </a>{" "}
              on your local machine. This runs the LLM for text generation with
              your own computation for free. For example if you are on a mac,
              you can just run following commands in your terminal:
              <div className="mockup-code my-2">
                <pre data-prefix="" className="text-info-content">
                  <code># install ollama and start the server</code>
                </pre>
                <pre data-prefix="$">
                  <code>brew install ollama</code>
                </pre>
                <pre data-prefix="$">
                  <code>export OLLAMA_HOST={origin} && ollama serve</code>
                </pre>
              </div>
            </span>

            <span>
              Now you have ollama running on your local machine on port 11434!
              Then open another terminal window and run{" "}
              <code className="bg-neutral text-white rounded-md p-1">
                ollama run llama3.2
              </code>{" "}
              to download the llama3.2 model. This is a 3B model that takes
              around 2GB of space to download.
            </span>

            <br />

            <button
              className="btn btn-secondary btn-sm my-2"
              type="button"
              onClick={onTestLLM}
              disabled={isPending}
            >
              Say hello to ollama
            </button>
            {isPending && <div>Loading...</div>}
            <div>{result}</div>
          </li>
        </ol>

        <div>
          <button className="btn btn-primary" type="button" onClick={onNext}>
            Next
          </button>
        </div>
      </form>
    </Section>
  );
}

function Ch2({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  return (
    <Section>
      <h2 className="text-xl font-bold">Embedding</h2>
      <div className="flex flex-col gap-2">
        <p>
          A simple RAG system includes two steps: <b>indexing</b> and{" "}
          <b>querying</b>.
        </p>

        <p>
          The <b>indexing</b> step involves converting your data into embeddings
          and storing them with metadata.
        </p>

        <p>
          During the <b>querying</b> step, when a user submits a query, we
          convert it into an embedding and compare it with all the stored
          embeddings to find the most semantically similar ones. We then
          retrieve the corresponding content and pass it to the LLM along with
          the user's query.
        </p>

        <p>
          Text embedding is a technique to convert text into numerical vectors
          (arrays of numbers) that capture the semantic meaning of the text.
        </p>

        <p>
          For example, the word "Dog" can be turned into an embedding like this:
        </p>

        <p className="truncate max-w-2xl">
          [0.0028247838,-0.011423655,-0.16130109,-0.04331225,0.046027105,0.0588...
        </p>

        <p>
          This embedding is a 768-dimensional vector (an array of 768 numbers)
          that represents the semantic meaning of the word "Dog".
        </p>

        <p>
          Just like calculating the distance between two points in a 2D or 3D
          space, we can similarly calculate the distance between two embeddings
          in higher dimensions. The closer they are, the more similar they are
          perceived to be.
        </p>

        <p>
          This technique unlocks new possibilities for us when we want to
          retrieve some content with short search query. Compared to directly
          asking AI which may lead to hallucination, we can first find
          semantically similar content via embedding and then provide them along
          with the question to AI. This greatly enhances the accuracy and
          reliability of generative AI models.
        </p>

        <p>
          There are also many details in RAG that can be further optimized,
          resulting in more variants such as Multi-Head RAG, Corrective RAG, or
          Graph RAG.
        </p>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-secondary" type="button" onClick={onPrev}>
          Previous
        </button>
        <button className="btn btn-primary" type="button" onClick={onNext}>
          Next
        </button>
      </div>
    </Section>
  );
}

const sqlCode = `CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(768) NOT NULL,
);`;

function Ch3({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [conn] = useLocalStorage("conn", "");
  const testSegmenter = trpc.testSegmenter.useMutation();
  const indexUrl = trpc.indexingUrl.useMutation();

  return (
    <Section>
      <h2 className="text-xl font-bold">Indexing</h2>

      <div className="flex flex-col gap-2">
        <p>
          Like we mentioned before, indexing is the process of converting your
          documents into searchable embeddings and storing them in a database.
          Think of it as creating a smart library catalog where each piece of
          content is transformed into a numerical format that computers can
          easily search through.
        </p>

        <p>
          First, let's create a table in the TiDB Cloud cluster to store our
          document segments and their embeddings, open the SQL editor in the
          TiDB Cloud console, copy the following SQL and paste it into the
          editor to run:
        </p>

        <CodeHighlight language="sql">{sqlCode}</CodeHighlight>

        <p>
          Here we will be using TiDB documentation as our data source, we can
          use the <b>Reader API</b> provided by{" "}
          <a
            className="underline"
            href="https://jina.ai"
            target="_blank"
            rel="noreferrer"
          >
            jina.ai
          </a>{" "}
          to get the plain text content of a webpage via it's URL. For example,
          to get the content of the{" "}
          <a
            className="underline"
            href="https://r.jina.ai/https://docs.pingcap.com/tidbcloud/vector-search-limitations"
            target="_blank"
            rel="noreferrer"
          >
            introduction of TiDB Vector Search
          </a>
          , we can simply send a get request to this URL or visit the following
          URL in your browser:{" "}
          <a
            className="underline"
            href="https://r.jina.ai/https://docs.pingcap.com/tidbcloud/vector-search-overview"
            target="_blank"
            rel="noreferrer"
          >
            https://r.jina.ai/https://docs.pingcap.com/tidbcloud/vector-search-overview
          </a>
          .
        </p>

        <p>
          After getting the content, we can also use the embedding API of
          jina.ai to turn the text content into embeddings.
        </p>

        <p>
          Before doing that, notice that most embedding models have token
          limits, so we often need to split the content into multiple segments.
          This is called <b>chunking</b> or <b>segmentation</b>. It can break
          down large documents into smaller, manageable chunks and smaller
          segments are often more precise for retrieval.
        </p>

        <p>
          Thanks to jina.ai, it also provides a <b>Segmenter API</b> that we can
          use to split the content into multiple segments. Click following
          button to split a paragraph of TiDB introduction into multiple
          segments.
        </p>

        <div>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => testSegmenter.mutateAsync()}
            >
              Test Segmenter
            </button>

            <div className="flex items-center gap-2">
              {testSegmenter.isPending && <span>Loading...</span>}
              {testSegmenter.data?.success && (
                <span className="text-success">
                  {testSegmenter.data.data.num_tokens} tokens,{" "}
                  {testSegmenter.data.data.num_chunks} chunks
                </span>
              )}
            </div>
          </div>
        </div>

        {testSegmenter.data?.success && (
          <div>
            {testSegmenter.data.data.chunks.map((chunk) => (
              <p
                key={chunk}
                className="text-sm"
                style={{ backgroundColor: stringToColor(chunk), color: "#fff" }}
              >
                {chunk}
              </p>
            ))}
          </div>
        )}

        <p>
          So now we can build an API to first use the <b>Reader API</b> to get
          the content of a webpage, then use the <b>Segmenter API</b> to split
          the content into multiple segments, and finally use the{" "}
          <b>Embedding API</b> to turn the segments into embeddings and save it
          in the database. Click the button to index following urls.
        </p>

        <div>
          <ul className="list-disc list-inside">
            <li>https://docs.pingcap.com/tidbcloud/vector-search-overview</li>
            <li>
              https://docs.pingcap.com/tidbcloud/vector-search-limitations
            </li>
          </ul>

          <div className="flex gap-2 mt-2">
            <button
              className="btn btn-accent btn-sm"
              type="button"
              onClick={async () => {
                await indexUrl.mutateAsync({
                  url: "https://docs.pingcap.com/tidbcloud/vector-search-overview",
                  db: btoa(conn || ""),
                });
                await indexUrl.mutateAsync({
                  url: "https://docs.pingcap.com/tidbcloud/vector-search-limitations",
                  db: btoa(conn || ""),
                });
              }}
            >
              Index URLs
            </button>

            <div className="flex items-center gap-2">
              {indexUrl.isPending && <span>Loading...</span>}
              {indexUrl.data?.success && (
                <span className="text-success">Indexed!</span>
              )}
            </div>
          </div>
        </div>

        <p>
          After indexing, we can continue to learn how to query the database to
          retrieve the most relevant content.
        </p>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-secondary" type="button" onClick={onPrev}>
          Previous
        </button>
        <button className="btn btn-primary" type="button" onClick={onNext}>
          Next
        </button>
      </div>
    </Section>
  );
}

function Ch4({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [conn] = useLocalStorage("conn", "");
  const [query, setQuery] = useState(
    "What is TiDB Vector Search's limitation?",
  );
  const queryDocuments = trpc.queryDocuments.useMutation();

  return (
    <Section>
      <h2 className="text-xl font-bold">Querying</h2>
      <div className="flex flex-col gap-2">
        <p>
          Remember how we turned our documents into numbers (embeddings) and
          saved them? Now let's learn how to find them again!
        </p>

        <p>Think of it like a game of "Find the Closest Points":</p>

        <ol className="list-decimal list-inside space-y-4">
          <li>
            First, when you ask a question, we turn your question into a
            multi-dimensional number (just like we did with the documents).
          </li>

          <li>
            Then, we ask TiDB to find the documents whose numbers are most
            similar to your question's numbers. It's like finding two points
            that are closest to each other!
          </li>

          <li>
            We can do this using a special function in TiDB called
            "vec_cosine_distance". It helps us find the closest matches, like
            this:
          </li>
        </ol>

        <CodeHighlight language="sql">
          {`SELECT
  url,
  content,
  vec_cosine_distance(embedding, '[your_question_embedding]') as distance
FROM documents
ORDER BY distance DESC
LIMIT 3;`}
        </CodeHighlight>

        <p>
          This tells TiDB: "Please look at all our saved documents and find the
          3 that are most similar to our question!"
        </p>

        <div className="alert">
          <p>
            💡 The smaller the "distance", the more similar the content is to
            your question.
          </p>
        </div>

        <p>
          Let's try it out! Type a question about TiDB Vector Search, and we'll
          find the most relevant information from our saved documents.
        </p>

        <input
          className="input input-bordered input-sm"
          type="text"
          placeholder="Write your question here"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className="btn btn-accent btn-sm"
            type="button"
            onClick={() =>
              queryDocuments.mutateAsync({ query, db: btoa(conn || "") })
            }
          >
            Query
          </button>

          <div className="flex items-center gap-2">
            {queryDocuments.isPending && <span>Loading...</span>}
          </div>
        </div>

        {queryDocuments.data?.success && (
          <table className="table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {queryDocuments.data.data.slice(0, 5).map((doc) => (
                <tr key={doc.content}>
                  <td className="max-w-[300px] truncate" title={doc.content}>
                    {doc.content}
                  </td>
                  <td>{doc.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-2">
        <button className="btn btn-secondary" type="button" onClick={onPrev}>
          Previous
        </button>
        <button className="btn btn-primary" type="button" onClick={onNext}>
          Next
        </button>
      </div>
    </Section>
  );
}

function Ch5({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [conn] = useLocalStorage("conn", "");
  const [query, setQuery] = useState(
    "What is TiDB Vector Search's limitation?",
  );
  const queryDocuments = trpc.queryDocuments.useMutation();
  const reranker = trpc.reranker.useMutation();

  return (
    <Section>
      <h2 className="text-xl font-bold">Reranking</h2>

      <div className="flex flex-col gap-2">
        <p>
          So far, we've learned how to index and query documents using TiDB
          Vector Search. However, the results may not always be accurate. For
          example, if we ask "What is TiDB Vector Search's limitation?", the
          results might include some unrelated content.
        </p>

        <p>
          To improve the accuracy of the results, we can use a technique called
          "reranking". Reranking is the process of re-ranking the results of a
          query to make them more relevant.
        </p>

        <p>Think of it like this:</p>

        <ol className="list-decimal list-inside space-y-4">
          <li>
            Vector search gives us a rough list of matches (like finding books
            by their covers)
          </li>
          <li>
            Reranking looks deeper at each match (like actually reading parts of
            the books)
          </li>
          <li>Then it sorts them again to give us the best answers first</li>
        </ol>

        <p>
          For example, if you ask "What's the price of TiDB Cloud?", vector
          search might find these:
        </p>

        <ul className="list-disc list-inside space-y-2">
          <li>"TiDB Cloud costs $0.99 per hour"</li>
          <li>"TiDB Cloud is a database service"</li>
          <li>"Cloud computing prices vary"</li>
        </ul>

        <p>
          The second and third results aren't very helpful, even if they're
          "similar". A reranker would look at each result more carefully and put
          the first one at the top since it directly answers the price question.
        </p>

        <p>
          And again, we can use jina.ai's Reranker API to do this by simply
          sending both the question and documents we found. It will give each
          document a new relevance score from 0 to 1.
        </p>

        <p>
          The cool thing about reranking is it understands context better than
          vector search alone. It's like having a smart assistant double-check
          our search results to make sure the most relevant ones come first.
          This is especially useful when you need very precise answers or you
          have lots of similar documents.
        </p>

        <p>
          Remember: Vector search helps us find relevant documents quickly, and
          reranking helps us put them in the perfect order!
        </p>

        <p>Now, let's try it out!</p>

        <input
          className="input input-bordered input-sm"
          type="text"
          placeholder="Write your question here"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className="btn btn-accent btn-sm"
            type="button"
            onClick={() =>
              queryDocuments.mutateAsync({ query, db: btoa(conn || "") })
            }
          >
            Query
          </button>

          <div className="flex items-center gap-2">
            {queryDocuments.isPending && <span>Loading...</span>}
          </div>
        </div>

        {queryDocuments.data?.success && (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {queryDocuments.data.data.slice(0, 5).map((doc) => (
                  <tr key={doc.content}>
                    <td className="max-w-[400px] truncate" title={doc.content}>
                      {doc.content}
                    </td>
                    <td>{doc.distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-2">
              <button
                className="btn btn-accent btn-sm"
                type="button"
                onClick={() => {
                  if (!queryDocuments.data?.success) return;

                  reranker.mutateAsync({
                    query,
                    documents:
                      queryDocuments.data.data.map((d) => d.content) || [],
                  });
                }}
              >
                Rerank
              </button>

              <div className="flex items-center gap-2">
                {reranker.isPending && <span>Loading...</span>}
              </div>
            </div>

            {reranker.data?.success && (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Content</th>
                      <th>Relevance Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reranker.data.data.map((d) => (
                      <tr key={d.document.text}>
                        <td
                          className="max-w-[400px] truncate"
                          title={d.document.text}
                        >
                          {d.document.text}
                        </td>
                        <td>{d.relevance_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p>
                  You can see the reranked results above and the overall quality
                  is much better compared to the previous results that we
                  directly queried from database.
                </p>

                <p>
                  And now we can send the reranked results with user's question
                  to a large language model chatbot so it can use the
                  information to give a better answer.
                </p>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button className="btn btn-secondary" type="button" onClick={onPrev}>
          Previous
        </button>
        <button className="btn btn-primary" type="button" onClick={onNext}>
          Next
        </button>
      </div>
    </Section>
  );
}

function Ch6({ onPrev }: { onPrev: () => void }) {
  const [conn] = useLocalStorage("conn", "");
  const queryDocuments = trpc.queryDocuments.useMutation();
  const reranker = trpc.reranker.useMutation();
  const [query, setQuery] = useState(
    "What is the max dimension that TiDB Vector supported?",
  );
  const { result, ask, isPending } = useChat();
  const { result: ragResult, ask: askRag, isPending: isRagPending } = useChat();
  const [ragPending, setRagPending] = useState(false);

  const askWithRag = async (query: string) => {
    try {
      setRagPending(true);

      // First get relevant docs
      const docs = await queryDocuments.mutateAsync({
        query,
        db: btoa(conn || ""),
      });

      if (!docs.success) return;

      // Rerank results
      const reranked = await reranker.mutateAsync({
        query,
        documents: docs.data.map((d) => d.content),
      });

      if (!reranked.success) return;

      const context = reranked.data
        .slice(0, 10)
        .map((d) => d.document.text)
        .join("\n\n");

      const prompt = `Based on following context, answer the question: ${query}\n\nContext: ${context}`;

      askRag(prompt);
    } catch (e) {
      alert(e);
    } finally {
      setRagPending(false);
    }
  };

  return (
    <Section>
      <h2 className="text-xl font-bold">Conclusion</h2>

      <div className="flex flex-col gap-2">
        <p>
          Awesome! We've built a complete RAG system from scratch. Let's recap
          what we learned:
        </p>

        <ol className="list-decimal list-inside space-y-4">
          <li>
            We set up TiDB Cloud for vector storage and Ollama for local LLM
            processing
          </li>
          <li>
            We learned how embeddings work - turning text into numbers that
            capture meaning
          </li>
          <li>
            We built an indexing pipeline using the Reader API to get content,
            the Segmenter API to chunk it, and stored embeddings in TiDB
          </li>
          <li>
            We implemented vector search to find relevant content using cosine
            similarity
          </li>
          <li>
            We improved results with reranking to get the most relevant matches
            first
          </li>
        </ol>

        <p>
          This is just the beginning - RAG systems can be enhanced in many ways:
        </p>

        <ul className="list-disc list-inside space-y-2">
          <li>Adding metadata filtering</li>
          <li>Using different chunking strategies</li>
          <li>
            Implementing hybrid search (combining vector and keyword search)
          </li>
          <li>Adding caching for frequently accessed content</li>
          <li>Building feedback loops to improve relevance over time</li>
        </ul>

        <div className="alert mt-4">
          <p>
            💡 The code for this tutorial is available on GitHub if you want to
            explore further or build your own RAG system!
          </p>
        </div>

        <p>
          Now lastly, if you have setup ollama locally following previous
          instructions, you can try to ask a question to the LLM with the
          context we just built.
        </p>

        <input
          className="input input-bordered input-sm"
          type="text"
          placeholder="Write your question here"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className="btn btn-accent btn-sm"
            onClick={() => {
              Promise.all([ask(query), askWithRag(query)]);
            }}
            disabled={isPending}
          >
            Ask
          </button>
        </div>

        <div className="flex gap-2 w-full text-sm">
          <div className="w-1/2">
            <h3>Direct</h3>
            <Markdown>{isPending ? "Loading..." : result}</Markdown>
          </div>
          <div className="w-1/2">
            <h3>With RAG</h3>
            <Markdown>
              {ragPending || isRagPending ? "Loading..." : ragResult}
            </Markdown>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-8">
        <button className="btn btn-secondary" type="button" onClick={onPrev}>
          Previous
        </button>
      </div>
    </Section>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const content = [
    <Ch1 onNext={nextStep} />,
    <Ch2 onNext={nextStep} onPrev={prevStep} />,
    <Ch3 onNext={nextStep} onPrev={prevStep} />,
    <Ch4 onNext={nextStep} onPrev={prevStep} />,
    <Ch5 onNext={nextStep} onPrev={prevStep} />,
    <Ch6 onPrev={prevStep} />,
  ].at(step);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable}  flex items-start justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-mono)]`}
    >
      <aside className="flex flex-col items-start gap-4">
        <ul className="steps steps-vertical">
          {[
            "Prepare",
            "Embedding",
            "Indexing",
            "Querying",
            "Reranking",
            "Conclusion",
          ].map((s, i) => (
            <li
              key={s}
              data-content={step > i ? "✓" : undefined}
              className={clsx("step", {
                "step-primary": step >= i,
              })}
            >
              {s}
            </li>
          ))}
        </ul>

        <label className="swap swap-rotate ml-2">
          {/* this hidden checkbox controls the state */}
          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                document.documentElement.setAttribute("data-theme", "emerald");
              } else {
                document.documentElement.setAttribute("data-theme", "dracula");
              }
            }}
          />

          {/* sun icon */}
          <svg
            className="swap-off h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>

          {/* moon icon */}
          <svg
            className="swap-on h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        </label>
      </aside>

      <article className="min-w-[670px]">
        <h1 className="text-2xl font-bold mb-8">
          How to build a RAG app with TiDB Vector Search
        </h1>
        {content}
      </article>
    </div>
  );
}
