import { Navigate, Outlet, ScrollRestoration, createBrowserRouter } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import ImprintPage from "@/pages/imprint";
import HomePage from "@/pages/index";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import ThemePreviewPage from "@/pages/theme-preview";
import TodosPage from "@/pages/todos/index";
import UserEditPage from "@/pages/users/[userId]/edit";
import UserListPage from "@/pages/users/index";
import UserNewPage from "@/pages/users/new";

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

function AuthGuard() {
  const { session } = useAuth();
  if (session.isPending)
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  if (!session.data) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminGuard() {
  const { session } = useAuth();
  if (session.isPending)
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    );
  if (session.data?.user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ── PUBLIC ──
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/imprint", element: <ImprintPage /> },
      { path: "/theme-preview", element: <ThemePreviewPage /> },

      // ── PROTECTED ──
      {
        element: <AuthGuard />,
        children: [
          { path: "/profile", element: <ProfilePage /> },
          { path: "/todos", element: <TodosPage /> },

          // ── ADMIN-ONLY ──
          {
            element: <AdminGuard />,
            children: [
              { path: "/users", element: <UserListPage /> },
              { path: "/users/new", element: <UserNewPage /> },
              { path: "/users/:userId/edit", element: <UserEditPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
