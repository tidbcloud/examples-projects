import { Highlight, themes } from "prism-react-renderer";
import { format } from "sql-formatter";
import { HyperText } from "@/components/HyperText";
import { trpc } from "@/utils/trpc";
import { useEffect, useRef, useState } from "react";
import { Primitive } from "zod";

function AiMessage({
  children,
  isLoading,
  taskResult,
}: {
  children?: React.ReactNode;
  isLoading?: boolean;
  taskResult?: TaskResultProps;
}) {
  return (
    <div className="chat chat-start max-w-[80%]">
      <div className="chat-header">Chat2Query</div>
      <div className="chat-bubble">
        {isLoading ? (
          <HyperText text="Connecting to the database..." />
        ) : taskResult ? (
          <TaskResult {...taskResult} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat chat-end">
      <div className="chat-header">You</div>
      <div className="chat-bubble chat-bubble-accent">{children}</div>
    </div>
  );
}

type Message = {
  fromUser?: boolean;
  content?: React.ReactNode;
  isLoading?: boolean;
  createdAt: number;
  taskResult?: TaskResultProps;
  persist?: boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSql(s: string) {
  try {
    return format(s ?? "");
  } catch {
    return s ?? "";
  }
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

function Table({ columns, rows }: { columns: string[]; rows: Primitive[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-xs">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="text-white">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, index) => (
                <td key={index}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TaskResultProps {
  task: string;
  sql: string;
  columns: string[];
  rows: Primitive[][];
}

function TaskResult({ task, sql, columns, rows }: TaskResultProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>{task}</div>
      <CodeHighlight language="sql">{formatSql(sql)}</CodeHighlight>
      {columns.length > 0 && rows.length > 0 ? (
        <Table columns={columns} rows={rows} />
      ) : (
        <div>No data found with this query</div>
      )}
    </div>
  );
}

const localStorageKey = "chat2query.example.messages";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { isLoading, error, refetch } = trpc.getDataSummary.useQuery(
    undefined,
    {
      enabled: false,
    },
  );
  const ask = trpc.ask.useMutation();
  // scroll to bottom when new message is added
  const scrollerRef = useRef<HTMLDivElement>(null);
  // clear input after submit
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const appendMessage = (message: Partial<Message>) => {
    setMessages((prev) => [
      ...prev,
      { ...message, createdAt: Date.now(), persist: message?.persist ?? true },
    ]);
  };
  const editLastMessage = (message: Partial<Message>) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      newMessages[lastIndex] = {
        ...newMessages[lastIndex],
        ...message,
      };
      return newMessages;
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const message = formData.get("message") as string;

    appendMessage({ fromUser: true, content: message });

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    await sleep(300);

    appendMessage({ fromUser: false, content: "Thinking..." });

    try {
      const response = await ask.mutateAsync({ question: message });
      if (response.code !== 200) {
        editLastMessage({ fromUser: false, content: response.msg });
        return;
      }
      if (response.result.result.status === "failed") {
        editLastMessage({
          fromUser: false,
          content: response.result.reason || response.result.result.sql_error,
        });
        return;
      }

      editLastMessage({
        fromUser: false,
        taskResult: {
          task: response.result.result.clarified_task,
          sql: response.result.result.sql,
          columns:
            response.result.result.data?.columns?.map((c) => c.col) ?? [],
          rows: response.result.result.data?.rows ?? [],
        },
      });
    } catch (error: any) {
      editLastMessage({
        fromUser: false,
        content: `Failed to generate the SQL query, please try again later. ${error.message}`,
      });
    }
  };

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages]);

  // load messages from local storage
  useEffect(() => {
    (async () => {
      appendMessage({ isLoading: true, persist: false });

      const res = await refetch();
      if (res.error) {
        editLastMessage({
          isLoading: false,
          content: ` Failed to connect to the database, ${res.error.message}`,
        });
        return;
      }

      if (res.data) {
        editLastMessage({
          isLoading: false,
          content: `Connected to the default data source.`,
        });
        await sleep(300);
        appendMessage({
          fromUser: false,
          content: res.data.result.result.description.system,
          persist: false,
        });
        await sleep(300);
        appendMessage({
          fromUser: false,
          content: `Feel free to ask me anything about the data.`,
          persist: false,
        });
      }

      const messages = JSON.parse(
        localStorage.getItem(localStorageKey) || "[]",
      ) as Message[];

      if (messages.length > 0) {
        messages.sort((a, b) => a.createdAt - b.createdAt);
        setMessages((prev) => [...prev, ...messages]);
        return;
      }
    })();
  }, []);

  // save messages to local storage
  useEffect(() => {
    const messagesToSave = messages.filter((m) => m.persist);
    if (messagesToSave.length === 0) return;
    localStorage.setItem(localStorageKey, JSON.stringify(messagesToSave));
  }, [messages]);

  return (
    <main className="max-w-[800px] mx-auto h-screen p-8 flex flex-col relative">
      <h1 className="text-2xl font-bold text-center mb-4">
        Chat2Query Example
      </h1>

      <div className="flex flex-col gap-4 flex-1">
        <div
          className="flex-1 w-full max-h-[calc(100vh-200px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          ref={scrollerRef}
        >
          {messages.map((message, index) =>
            message.fromUser ? (
              <UserMessage key={index} {...message}>
                {message.content}
              </UserMessage>
            ) : (
              <AiMessage key={index} {...message}>
                {message.content}
              </AiMessage>
            ),
          )}
        </div>

        <form
          className="max-w-[800px] w-full absolute bottom-0 left-0 p-8"
          onSubmit={handleSubmit}
        >
          <textarea
            className="textarea textarea-bordered w-full resize-none pr-24"
            name="message"
            ref={inputRef}
            onKeyDown={(e) => {
              if (isLoading || error) return;

              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div className="tooltip absolute right-12 top-12" data-tip="⌘+Enter">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!!error || isLoading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function Home() {
  return <App />;
}
