import clsx from "clsx";

export function Loader({ className }: { className?: string }) {
  return <div className={clsx("loader", className)} />;
}
