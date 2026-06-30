import { ArrowRight, Database, ListChecks, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWindowScroll } from "@/hooks/useWindowScroll";

const features = [
  {
    description:
      "React 19 + Vite + TailwindCSS v4 + shadcn/ui im Frontend, Hono auf Bun im Backend.",
    icon: ListChecks,
    title: "Voll verdrahteter Stack",
  },
  {
    description:
      "SQLite via bun:sqlite mit Plain-SQL-Migrations und einer beispielhaften Todo-Ressource in app.db.",
    icon: Database,
    title: "Batteries included",
  },
  {
    description:
      "better-auth mit E-Mail/Passwort, geschützten Routen und admin-only Benutzerverwaltung.",
    icon: ShieldCheck,
    title: "Auth out of the box",
  },
];

export default function HomePage() {
  const { y } = useWindowScroll();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const parallaxOffset = useMemo(
    () => (prefersReducedMotion ? 0 : y * 0.3),
    [prefersReducedMotion, y],
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />

      <section className="relative flex min-h-[78vh] items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1600&q=80"
          alt="Abstract gradient"
          className="absolute inset-x-0 -top-[40%] h-[140%] w-full object-cover will-change-transform"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        />
        <div className="from-background/80 via-background/50 to-background absolute inset-0 bg-gradient-to-b" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <span className="border-primary/30 bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="bg-primary size-1.5 rounded-full" />
            Agent-driven boilerplate
          </span>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-balance md:text-7xl">
            Ship faster.{" "}
            <span className="from-primary to-brand bg-gradient-to-r bg-clip-text text-transparent">
              Start from here.
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-lg leading-relaxed">
            Reclaude ist ein Frontend/Backend-Boilerplate mit React, Hono, SQLite und Auth —
            inklusive eines spec-getriebenen Multi-Agent-Workflows für Claude Code.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="xl"
              className="shadow-primary/25 hover:shadow-primary/35 h-12 gap-2 rounded-xl px-7 text-base font-semibold shadow-xl transition-all"
            >
              <Link to="/login">
                Jetzt einloggen
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-border bg-card/40 hover:bg-accent hover:text-foreground h-12 rounded-xl px-7 text-base font-semibold backdrop-blur"
            >
              <Link to="/todos">Zur Todo-Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group border-border bg-card hover:border-primary/30 hover:bg-accent rounded-2xl border p-8 transition-all"
            >
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 mb-5 flex size-12 items-center justify-center rounded-xl transition-colors">
                <feature.icon className="size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-border border-t py-8">
        <p className="text-muted-foreground text-center text-sm">
          © {new Date().getFullYear()} Reclaude
        </p>
      </footer>
    </div>
  );
}
