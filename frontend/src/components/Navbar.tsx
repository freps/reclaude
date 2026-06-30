import { ChevronDown, LogIn } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const isProd = import.meta.env.PROD;

export default function Navbar() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    await navigate("/");
  }

  return (
    <header className="bg-background/80 border-border sticky top-0 z-50 border-b backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground shadow-primary/20 flex size-8 items-center justify-center rounded-lg text-sm font-black shadow-lg transition-transform group-hover:scale-105">
            R
          </span>
          <span className="text-base font-bold tracking-tight">
            Re<span className="text-primary">claude</span>
          </span>
          {!isProd && (
            <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-bold tracking-wider text-red-500 uppercase">
              Dev
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-1 text-sm font-medium sm:flex">
          {[
            { to: "/", label: "Startseite", end: true },
            ...(session.data ? [{ to: "/todos", label: "Todos", end: false }] : []),
            ...(session.data?.user?.role === "admin"
              ? [{ to: "/benutzer", label: "Benutzer", end: false }]
              : []),
            { to: "/impressum", label: "Impressum", end: false },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {!session.isPending && (
          <>
            {!session.data ? (
              <Button asChild className="h-9 gap-2 rounded-lg px-4 font-semibold">
                <Link to="/login">
                  <LogIn className="size-4" />
                  Login
                </Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-foreground hover:bg-accent flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none">
                  {session.data?.user?.email}
                  <ChevronDown className="size-4 shrink-0 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => navigate("/profil")}>Profil</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleSignOut}>Abmelden</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
