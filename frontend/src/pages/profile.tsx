import { CircleAlert, CircleCheck } from "lucide-react";
import { useState } from "react";

import AppLogo from "@/components/AppLogo";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        setError(result.error.message ?? "Password could not be changed.");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="flex items-center justify-center px-4 py-24">
        <div className="border-border bg-card w-full max-w-md rounded-xl border p-10">
          <div className="mb-8 text-center">
            <AppLogo />
            <h2 className="text-2xl font-bold tracking-tight">Change password</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Update your password.</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm">
                <CircleAlert className="size-4 shrink-0" />
                {error}
              </p>
            )}

            {success && (
              <p className="border-primary/30 bg-primary/10 text-primary flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm">
                <CircleCheck className="size-4 shrink-0" />
                Password changed successfully.
              </p>
            )}

            <Button
              type="submit"
              variant="default"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Saving…" : "Change password"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
