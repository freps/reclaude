import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLogo from "@/components/AppLogo";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { error, isLoading, session, signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session.data) {
      navigate("/todos", { replace: true });
    }
  }, [session.data, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signInWithEmail(email, password);
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="flex items-center justify-center px-4 py-24">
        <div className="border-border bg-card w-full max-w-md rounded-xl border p-10">
          <div className="mb-8 text-center">
            <AppLogo />
            <h2 className="text-2xl font-bold tracking-tight">Willkommen zurück</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Melde dich an, um deine Todos zu öffnen.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm">
                <CircleAlert className="size-4 shrink-0" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="default"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Wird angemeldet…" : "Einloggen"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
