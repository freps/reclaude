import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  Info,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button/button";

export default function ThemePreviewPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <div className="min-h-screen">
      {/* Dark mode toggle */}
      <button
        className="border-border bg-background hover:bg-muted fixed top-4 right-4 z-50 flex size-9 items-center justify-center rounded-lg border shadow-sm transition-colors"
        onClick={toggleDark}
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      <Navbar />

      <main className="mx-auto max-w-5xl space-y-16 px-8 py-16">
        {/* Hero section */}
        <section className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Theme Preview</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            The authoritative visual reference for the design system — purple accent, dark navy
            secondary, clean typography, and generous spacing.
          </p>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" size="xl">
              Primary
            </Button>
            <Button variant="secondary" size="xl">
              Secondary
            </Button>
            <Button variant="outline" size="xl">
              Outline
            </Button>
            <Button variant="ghost" size="xl">
              Ghost
            </Button>
            <Button variant="link" size="xl">
              Link
            </Button>
            <Button variant="destructive" size="xl">
              Destructive
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" size="xl">
              Standard (xl)
            </Button>
            <Button variant="default" size="lg">
              Compact (lg)
            </Button>
            <Button variant="default" size="default">
              Small (default)
            </Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Badges</h2>
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">Variants</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary text-primary-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold">
                Primary
              </span>
              <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold">
                Secondary
              </span>
              <span className="border-border text-foreground inline-flex items-center rounded-full border bg-transparent px-2.5 py-0.5 text-xs font-semibold">
                Outline
              </span>
              <span className="bg-destructive inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold text-white">
                Destructive
              </span>
            </div>
            <p className="text-muted-foreground pt-2 text-sm">Example status labels</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary text-primary-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold">
                Active
              </span>
              <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold">
                Draft
              </span>
              <span className="border-border text-foreground inline-flex items-center rounded-full border bg-transparent px-2.5 py-0.5 text-xs font-semibold">
                In review
              </span>
              <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold">
                Archived
              </span>
              <span className="bg-destructive inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold text-white">
                Rejected
              </span>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Alerts / Callouts</h2>
          <div className="space-y-3">
            <div className="border-border bg-card flex gap-3 rounded-lg border p-4">
              <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Note</p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  Neutral information — no action required, but relevant for context.
                </p>
              </div>
            </div>
            <div className="border-primary/30 bg-primary/10 text-primary flex gap-3 rounded-lg border p-4">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Success</p>
                <p className="mt-0.5 text-sm opacity-80">The action completed successfully.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Warning</p>
                <p className="mt-0.5 text-sm opacity-80">
                  Please double-check this value — it could lead to unexpected results.
                </p>
              </div>
            </div>
            <div className="border-destructive/30 bg-destructive/10 text-destructive flex gap-3 rounded-lg border p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Error</p>
                <p className="mt-0.5 text-sm opacity-80">The request failed. Please try again.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Stat Cards</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-6">
              <p className="text-4xl font-bold">100+</p>
              <p className="text-muted-foreground mt-2 text-sm">Example metric one.</p>
            </div>
            <div className="bg-card rounded-xl p-6">
              <p className="text-4xl font-bold">250+</p>
              <p className="text-muted-foreground mt-2 text-sm">Example metric two.</p>
            </div>
            <div className="bg-card rounded-xl p-6">
              <p className="text-4xl font-bold">98%</p>
              <p className="text-muted-foreground mt-2 text-sm">Example metric three.</p>
            </div>
          </div>
        </section>

        {/* Empty State */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Empty State</h2>
          <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
            <div className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-xl">
              <FolderOpen className="size-6" />
            </div>
            <h3 className="font-semibold">No entries yet</h3>
            <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
              As soon as data is added, it will appear here. Start with your first entry now.
            </p>
            <Button variant="default" size="xl" className="mt-6">
              Add now
            </Button>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Typography</h2>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-bold">Heading 2</h2>
            <h3 className="text-xl font-semibold">Heading 3</h3>
            <p className="text-base">Body text — regular weight, dark navy color.</p>
            <p className="text-muted-foreground text-sm">Muted text — smaller, gray.</p>
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Colors</h2>
          <div className="flex gap-3">
            <div className="space-y-1 text-center">
              <div className="bg-primary size-16 rounded-lg" />
              <span className="text-muted-foreground text-xs">Primary</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="bg-secondary size-16 rounded-lg" />
              <span className="text-muted-foreground text-xs">Secondary</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="bg-card size-16 rounded-lg" />
              <span className="text-muted-foreground text-xs">Card</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="bg-muted size-16 rounded-lg" />
              <span className="text-muted-foreground text-xs">Muted</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="bg-destructive size-16 rounded-lg" />
              <span className="text-muted-foreground text-xs">Destructive</span>
            </div>
            <div className="space-y-1 text-center">
              <div className="border-border bg-background size-16 rounded-lg border" />
              <span className="text-muted-foreground text-xs">Background</span>
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Border Radius</h2>
          <div className="flex flex-wrap items-end gap-6">
            {[
              { cls: "rounded-sm", label: "rounded-sm" },
              { cls: "rounded-md", label: "rounded-md" },
              { cls: "rounded-lg", label: "rounded-lg" },
              { cls: "rounded-xl", label: "rounded-xl" },
              { cls: "rounded-2xl", label: "rounded-2xl" },
              { cls: "rounded-full", label: "rounded-full" },
            ].map(({ cls, label }) => (
              <div key={label} className="space-y-2 text-center">
                <div className={`border-border bg-card size-16 border ${cls}`} />
                <span className="text-muted-foreground text-xs">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Base radius: <code className="bg-muted rounded px-1 py-0.5 text-xs">0.75rem</code> (lg)
            — cards and inputs use{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">rounded-lg</code>, larger
            containers use <code className="bg-muted rounded px-1 py-0.5 text-xs">rounded-xl</code>.
          </p>
        </section>

        {/* Back link */}
        <Link to="/" className="text-muted-foreground hover:text-foreground inline-block text-sm">
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
