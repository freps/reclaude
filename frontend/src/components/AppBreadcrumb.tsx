import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  crumbs: { href?: string; label: string }[];
};

export default function AppBreadcrumb({ crumbs }: Props) {
  return (
    <nav className="flex min-w-0 items-center gap-1 py-3 text-sm">
      {crumbs.map((crumb, index) => (
        <span key={index} className="flex min-w-0 items-center gap-1">
          {index > 0 && <ChevronRight className="text-muted-foreground size-3.5 shrink-0" />}
          {crumb.href ? (
            <Link
              to={crumb.href}
              className="text-muted-foreground hover:text-foreground min-w-0 truncate transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground min-w-0 truncate font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
