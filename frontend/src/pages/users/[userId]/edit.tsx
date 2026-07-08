import { ChevronLeft, CircleAlert, Loader2, Save, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppBreadcrumb from "@/components/AppBreadcrumb";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
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
import { findUser, updateUser, type Role, type UserDTO } from "@/lib/users";

export default function UserEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState<null | UserDTO>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<null | string>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [banned, setBanned] = useState(false);
  const [useResetPassword, setUseResetPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    void findUser(userId)
      .then((u) => {
        setUser(u);
        setName(u.name);
        setEmail(u.email);
        setRole(u.role);
        setBanned(u.banned);
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : "User could not be loaded.");
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  const canSave = useMemo(
    () => name.trim().length > 0 && email.trim().length > 0 && !saving,
    [name, email, saving],
  );

  async function handleSave() {
    if (!canSave || !userId) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        banned,
        email: email.trim(),
        name: name.trim(),
        role,
      };
      if (useResetPassword && resetPassword) {
        body.resetPassword = resetPassword;
      }
      await updateUser(userId, body);
      showToast("User saved.");
      await navigate("/users");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <Navbar />
        <div className="text-muted-foreground p-10 text-sm">Loading…</div>
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="bg-background text-foreground min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm">
            <CircleAlert className="size-4 shrink-0" />
            {loadError ?? "User not found."}
          </p>
          <Button variant="ghost" onClick={() => void navigate("/users")}>
            <ChevronLeft data-icon="inline-start" />
            Back to overview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl space-y-6 px-6 pb-32">
        <AppBreadcrumb
          crumbs={[{ label: "User management", href: "/users" }, { label: user.name }]}
        />

        <PageHeader
          title="Edit user"
          subtitle="Base data, role, and status. Resetting the password is optional."
          leading={
            <span className="border-primary/35 bg-primary/10 text-primary inline-flex size-12 shrink-0 items-center justify-center rounded-[0.875rem] border">
              <ShieldCheck className="size-6" />
            </span>
          }
        />

        <form
          id="user-edit-form"
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <Label htmlFor="u-status" className="text-[0.8125rem]">
                  Status
                </Label>
                <Select
                  onValueChange={(v) => setBanned(v === "inactive")}
                  value={banned ? "inactive" : "active"}
                >
                  <SelectTrigger id="u-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive (deactivated)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-[12rem_1fr] md:items-start">
                <Label htmlFor="u-reset" className="pt-1 text-[0.8125rem]">
                  Reset password
                </Label>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="u-reset-toggle"
                    className="text-muted-foreground flex items-center gap-2 py-1 text-xs leading-6"
                  >
                    <Checkbox
                      id="u-reset-toggle"
                      checked={useResetPassword}
                      onCheckedChange={setUseResetPassword}
                    />
                    set a new one
                  </label>
                  <Input
                    id="u-reset"
                    disabled={!useResetPassword}
                    placeholder={useResetPassword ? "••••••••" : "keep unchanged"}
                    type="password"
                    autoComplete="new-password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                  />
                </div>
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
          <Button type="submit" form="user-edit-form" disabled={!canSave}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
