import { Navigate, Outlet, ScrollRestoration, createBrowserRouter } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import BenutzerEditPage from "@/pages/benutzer/[userId]/edit";
import BenutzerListPage from "@/pages/benutzer/index";
import BenutzerNewPage from "@/pages/benutzer/new";
import ImpressumPage from "@/pages/impressum";
import HomePage from "@/pages/index";
import LoginPage from "@/pages/login";
import ProfilPage from "@/pages/profil";
import ThemePreviewPage from "@/pages/theme-preview";
import TodosPage from "@/pages/todos/index";

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
        <span className="text-muted-foreground text-sm">Laden…</span>
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
        <span className="text-muted-foreground text-sm">Laden…</span>
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
      { path: "/impressum", element: <ImpressumPage /> },
      { path: "/theme-preview", element: <ThemePreviewPage /> },

      // ── PROTECTED ──
      {
        element: <AuthGuard />,
        children: [
          { path: "/profil", element: <ProfilPage /> },
          { path: "/todos", element: <TodosPage /> },

          // ── ADMIN-ONLY ──
          {
            element: <AdminGuard />,
            children: [
              { path: "/benutzer", element: <BenutzerListPage /> },
              { path: "/benutzer/new", element: <BenutzerNewPage /> },
              { path: "/benutzer/:userId/edit", element: <BenutzerEditPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
