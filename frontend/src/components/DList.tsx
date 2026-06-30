import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  head?: ReactNode;
};

// Card-Row-Liste aus dem Prototyp (dlist / dlist-head / dlist-row):
// Kopfzeile ohne Box, darunter jede Zeile als eigene Card mit Abstand.
export default function DList({ children, head }: Props) {
  return (
    <div>
      {head}
      <div className="flex flex-col gap-[0.55rem]">{children}</div>
    </div>
  );
}
