import { trpc } from "@/utils/trpc";
import { Input } from "./Input";

export function Header() {
  const createTodo = trpc.createTodo.useMutation();
  const utils = trpc.useUtils();
  const handleSubmit = async (title: string) => {
    await createTodo.mutateAsync({ title });
    utils.listTodos.invalidate();
  };

  return (
    <header className="header" data-testid="header">
      <Input
        onSubmit={handleSubmit}
        label="New Todo Input"
        placeholder="What needs to be done?"
        loading={createTodo.isPending}
      />
    </header>
  );
}
