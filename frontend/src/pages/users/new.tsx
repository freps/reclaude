import { ChevronLeft, Loader2, Save, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppBreadcrumb from "@/components/AppBreadcrumb";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { useToast } from "@/hooks/useToast";
import { createUser, type Role } from "@/lib/users";

export default function UserNewPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => name.trim().length > 0 && email.trim().length > 0 && password.length > 0 && !saving,
    [name, email, password, saving],
  );

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await createUser({
        email: email.trim(),
        name: name.trim(),
        password,
        role,
      });
      showToast("User created.");
      await navigate("/users");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "User could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl space-y-6 px-6 pb-32">
        <AppBreadcrumb
          crumbs={[{ label: "User management", href: "/users" }, { label: "New user" }]}
        />

        <PageHeader
          title="Create a new user"
          subtitle="Creates a new user. The user can change the initial password later in their profile."
          leading={
            <span className="border-primary/35 bg-primary/10 text-primary inline-flex size-12 shrink-0 items-center justify-center rounded-[0.875rem] border">
              <ShieldCheck className="size-6" />
            </span>
          }
        />

        <form
          id="user-new-form"
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className="bg-card rounded-2xl border p-6">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-[12rem_1fr] md:items-center">
                <Label htmlFor="u-name" className="text-[0.8125rem]">
                  Name
                </Label>
                <Input
                  id="u-name"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[12rem_1fr] md:items-center">
                <Label htmlFor="u-email" className="text-[0.8125rem]">
                  Email
                </Label>
                <Input
                  id="u-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[12rem_1fr] md:items-center">
                <Label htmlFor="u-role" className="text-[0.8125rem]">
                  Role
                </Label>
                <Select onValueChange={(v) => setRole(v as Role)} value={role}>
                  <SelectTrigger id="u-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-[12rem_1fr] md:items-center">
                <Label htmlFor="u-password" className="text-[0.8125rem]">
                  Initial password
                </Label>
                <Input
                  id="u-password"
                  required
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Sticky footer */}
      <div className="bg-background/90 fixed right-0 bottom-0 left-0 z-10 border-t backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <Button variant="ghost" onClick={() => void navigate("/users")}>
            <ChevronLeft data-icon="inline-start" />
            Back to overview
          </Button>
          <Button type="submit" form="user-new-form" disabled={!canSave}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Create user
          </Button>
        </div>
      </div>
    </div>
  );
}
