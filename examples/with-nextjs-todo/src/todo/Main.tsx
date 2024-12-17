import { Item } from "./Item";
import clsx from "clsx";
import { useFilterState } from "./helper";
import { trpc } from "@/utils/trpc";
import { TodoItem } from "@/server/db/schema";

export function Main() {
  const [filter] = useFilterState();
  const { data, isFetching } = trpc.listTodos.useQuery({
    page: 1,
    limit: 100,
    filter,
  });

  const toggleAll = trpc.toggleAll.useMutation();
  const utils = trpc.useUtils();
  const handleToggleAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await toggleAll.mutateAsync({ completed: e.target.checked });
    utils.listTodos.invalidate();
  };

  return (
    <main className="main" data-testid="main">
      {data?.todos.length > 0 ? (
        <div className="toggle-all-container">
          <input
            className="toggle-all"
            type="checkbox"
            id="toggle-all"
            data-testid="toggle-all"
            checked={data.todos.every((todo: TodoItem) => todo.completed)}
            onChange={handleToggleAll}
            disabled={toggleAll.isPending || isFetching}
          />
          <label className="toggle-all-label" htmlFor="toggle-all">
            Toggle All Input
          </label>
        </div>
      ) : null}
      <ul className={clsx("todo-list")} data-testid="todo-list">
        {data?.todos.map((todo: TodoItem, index: number) => (
          <Item
            title={todo.title}
            completed={todo.completed}
            id={todo.id}
            key={todo.id}
          />
        ))}
      </ul>

      {isFetching && <p className="fetch-indicator">fetching todos...</p>}
      {toggleAll.isPending && (
        <p className="fetch-indicator">toggle all todos...</p>
      )}
    </main>
  );
}
