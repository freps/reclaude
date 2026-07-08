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

export default function UserListPage() {
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
      setError(e instanceof Error ? e.message : "Users could not be loaded.");
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
        showToast("User reactivated.");
      } else {
        await banUser(user.id);
        showToast("User deactivated.");
      }
      await loadUsers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Status could not be changed.";
      setError(msg);
      showToast(msg);
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <AppBreadcrumb crumbs={[{ label: "User management" }]} />

        <div className="py-6">
          <PageHeader
            title="User management"
            subtitle="Create users, assign roles, and activate/deactivate accounts."
            leading={
              <span className="border-primary/35 bg-primary/10 text-primary inline-flex size-12 shrink-0 items-center justify-center rounded-[0.875rem] border">
                <ShieldCheck className="size-6" />
              </span>
            }
            actions={<CreateButton to="/users/new" tooltipText="Create a new user" />}
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableEmpty>Loading…</TableEmpty>
              ) : users.length === 0 ? (
                <TableEmpty>No users yet.</TableEmpty>
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
                        {user.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.banned ? "destructive" : "outline"}>
                        {user.banned ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                          size="sm"
                          variant="outline"
                        >
                          <UserPen className="size-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => void toggleBan(user)}
                          size="sm"
                          variant={user.banned ? "secondary" : "destructive"}
                        >
                          {user.banned ? "Activate" : "Deactivate"}
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
