import type { ReactNode } from "react";

type Props = {
  actions?: ReactNode;
  eyebrow?: string;
  leading?: ReactNode;
  subtitle?: string;
  title: string;
};

export default function PageHeader({ actions, eyebrow, leading, subtitle, title }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        {leading}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              {eyebrow}
            </p>
          )}
          <h1
            className="font-display text-2xl font-bold tracking-tight"
            style={eyebrow ? { marginTop: "0.25rem" } : undefined}
          >
            {title}
          </h1>
          {subtitle && <p className="text-muted-foreground mt-0.5 text-[0.8125rem]">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 self-center">{actions}</div>}
    </div>
  );
}
