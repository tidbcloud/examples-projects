import { memo, useState } from "react";
import clsx from "clsx";
import { Input } from "./Input";
import { trpc } from "@/utils/trpc";
import { Loader } from "./Loader";

const _Item = function Item({
  title,
  completed,
  id,
}: { title: string; completed: boolean; id: number }) {
  const [isWritable, setIsWritable] = useState(false);
  const utils = trpc.useUtils();
  const toggleItem = trpc.toggleTodo.useMutation();
  const removeItem = trpc.deleteTodo.useMutation();
  const updateItem = trpc.editTodo.useMutation();

  const handleDoubleClick = () => {
    setIsWritable(true);
  };

  const handleBlur = () => {
    setIsWritable(false);
  };

  const handleToggle = async () => {
    await toggleItem.mutateAsync({ id });
    utils.listTodos.invalidate();
  };

  const handleRemove = async () => {
    await removeItem.mutateAsync({ id });
    utils.listTodos.invalidate();
  };

  const handleUpdate = async (title: string) => {
    if (title.length === 0) {
      await removeItem.mutateAsync({ id });
    } else {
      await updateItem.mutateAsync({ id, title });
    }

    await utils.listTodos.invalidate();
    setIsWritable(false);
  };

  const loading =
    toggleItem.isPending || removeItem.isPending || updateItem.isPending;

  return (
    <li className={clsx({ completed })} data-testid="todo-item">
      <div className="view">
        {isWritable ? (
          <Input
            onSubmit={handleUpdate}
            label="Edit Todo Input"
            defaultValue={title}
            onBlur={handleBlur}
            loading={loading}
          />
        ) : (
          <>
            <input
              className="toggle"
              type="checkbox"
              data-testid="todo-item-toggle"
              checked={completed}
              onChange={handleToggle}
              disabled={loading}
            />
            <label
              data-testid="todo-item-label"
              onDoubleClick={handleDoubleClick}
            >
              {title}
            </label>
            {loading ? (
              <Loader className="right" />
            ) : (
              <button
                className="destroy right"
                data-testid="todo-item-button"
                onClick={handleRemove}
              />
            )}
          </>
        )}
      </div>
    </li>
  );
};

export const Item = memo(_Item);
