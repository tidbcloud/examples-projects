import { useRef } from "react";
import { Loader } from "./Loader";

const sanitize = (s: string) => {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  const reg = /[&<>"'/]/gi;
  return s.replace(reg, (match: string) => map[match]);
};

const hasValidMin = (value: string, min: number) => {
  return value.length >= min;
};

export function Input({
  onSubmit,
  placeholder,
  label,
  defaultValue,
  onBlur,
  loading = false,
}: {
  onSubmit?: (value: string) => void | Promise<void>;
  placeholder?: string;
  label?: string;
  defaultValue?: string;
  onBlur?: () => void;
  loading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = (e.target as HTMLInputElement).value.trim();

      if (!hasValidMin(value, 2)) return;

      await onSubmit?.(sanitize(value));

      requestAnimationFrame(() => {
        (e.target as HTMLInputElement).value = "";
        inputRef.current?.focus();
      });
    }
  };

  return (
    <div className="input-container">
      {loading && <Loader />}
      <input
        ref={inputRef}
        className="new-todo"
        id="todo-input"
        type="text"
        data-testid="text-input"
        autoFocus
        placeholder={placeholder}
        defaultValue={defaultValue}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <label className="visually-hidden" htmlFor="todo-input">
        {label}
      </label>
    </div>
  );
}
