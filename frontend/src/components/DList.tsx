import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  head?: ReactNode;
};

// Card-row list from the prototype (dlist / dlist-head / dlist-row):
// header row without a box, below it each row as its own card with spacing.
export default function DList({ children, head }: Props) {
  return (
    <div>
      {head}
      <div className="flex flex-col gap-[0.55rem]">{children}</div>
    </div>
  );
}
