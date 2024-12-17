import clsx from "clsx";
import { Filter, useFilterState } from "./helper";
import { trpc } from "@/utils/trpc";
import type { TodoItem } from "@/server/db/schema";

export function Footer() {
  const [filter, setFilter] = useFilterState();
  const { data } = trpc.listTodos.useQuery({
    page: 1,
    limit: 100,
    filter,
  });
  const utils = trpc.useUtils();
  const clearCompleted = trpc.clearCompleted.useMutation();

  const activeTodos =
    data?.todos.filter((todo: TodoItem) => !todo.completed) ?? [];

  const handleClearCompleted = async () => {
    await clearCompleted.mutateAsync();
    utils.listTodos.invalidate();
  };

  return (
    <footer className="footer" data-testid="footer">
      <span className="todo-count">{`${activeTodos.length} ${activeTodos.length === 1 ? "item" : "items"} left!`}</span>
      <ul className="filters" data-testid="footer-navigation">
        <li>
          <a
            className={clsx({ selected: filter === Filter.All })}
            href="#/"
            onClick={() => setFilter(Filter.All)}
          >
            All
          </a>
        </li>
        <li>
          <a
            className={clsx({ selected: filter === Filter.Active })}
            href="#/active"
            onClick={() => setFilter(Filter.Active)}
          >
            Active
          </a>
        </li>
        <li>
          <a
            className={clsx({ selected: filter === Filter.Completed })}
            href="#/completed"
            onClick={() => setFilter(Filter.Completed)}
          >
            Completed
          </a>
        </li>
      </ul>
      <button
        className="clear-completed"
        disabled={clearCompleted.isPending}
        onClick={handleClearCompleted}
      >
        {clearCompleted.isPending ? "Clearing..." : "Clear completed"}
      </button>
    </footer>
  );
}
