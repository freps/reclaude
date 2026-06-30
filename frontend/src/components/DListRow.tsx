import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
  head?: boolean;
  href?: string;
};

export default function DListRow({ children, className, head, href }: Props) {
  if (head) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex min-w-0 items-center px-[1.15rem] pb-1.5",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          "bg-card border-border hover:border-primary/40 flex min-h-14 items-center rounded-xl border px-[1.15rem] py-3.5 text-sm transition-all hover:-translate-y-px hover:shadow-[0_14px_32px_-20px_rgba(0,0,0,0.8)]",
          className,
        )}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "bg-card border-border flex min-h-14 items-center rounded-xl border px-[1.15rem] py-3.5 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
