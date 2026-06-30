import { CircleAlert, ShieldCheck, UserPen, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppBreadcrumb from "@/components/AppBreadcrumb";
import CreateButton from "@/components/CreateButton";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/useToast";
import { banUser, formatDate, listUsers, reactivateUser, type UserDTO } from "@/lib/users";

export default function BenutzerListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Benutzer konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function toggleBan(user: UserDTO) {
    setError(null);
    try {
      if (user.banned) {
        await reactivateUser(user.id);
        showToast("Benutzer reaktiviert.");
      } else {
        await banUser(user.id);
        showToast("Benutzer deaktiviert.");
      }
      await loadUsers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Status konnte nicht geändert werden.";
      setError(msg);
      showToast(msg);
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <AppBreadcrumb crumbs={[{ label: "Benutzerverwaltung" }]} />

        <div className="py-6">
          <PageHeader
            title="Benutzerverwaltung"
            subtitle="Benutzer anlegen, Rollen vergeben und Accounts aktivieren/deaktivieren."
            leading={
              <span className="border-primary/35 bg-primary/10 text-primary inline-flex size-12 shrink-0 items-center justify-center rounded-[0.875rem] border">
                <ShieldCheck className="size-6" />
              </span>
            }
            actions={<CreateButton to="/benutzer/new" tooltipText="Neuen Benutzer anlegen" />}
          />
        </div>

        {error && (
          <p className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm">
            <CircleAlert className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt am</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableEmpty>Laden…</TableEmpty>
              ) : users.length === 0 ? (
                <TableEmpty>Keine Benutzer vorhanden.</TableEmpty>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground size-4" />
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Admin" : "Benutzer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.banned ? "destructive" : "outline"}>
                        {user.banned ? "Inaktiv" : "Aktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => navigate(`/benutzer/${user.id}/edit`)}
                          size="sm"
                          variant="outline"
                        >
                          <UserPen className="size-4" />
                          Bearbeiten
                        </Button>
                        <Button
                          onClick={() => void toggleBan(user)}
                          size="sm"
                          variant={user.banned ? "secondary" : "destructive"}
                        >
                          {user.banned ? "Aktivieren" : "Deaktivieren"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
