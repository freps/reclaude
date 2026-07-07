# Frontend Architecture

## Tech Stack

- React 19 (Function Components, TypeScript)
- TypeScript (strict mode)
- Vite
- TailwindCSS v4
- shadcn/ui (UI components)
- React Router v7 (manual route definitions)
- Lucide React (icons)
- better-auth (authentication client, `better-auth/react`)
- Bun (package manager)

## Folder Structure

Top-Level (von Hand gepflegt): `public/` (Static Assets), `eslint.config.mjs`,
`vite.config.ts`, `tsconfig.json` / `tsconfig.app.json`, `components.json`
(shadcn/ui-Config), `.prettierrc`. Entry-Files in `src/`: `main.tsx` (ReactDOM),
`App.tsx` (ToastProvider > RouterProvider), `router.tsx` (React Router v7), `style.css`
(Tailwind + dark-first Tokens), `vite-env.d.ts` (Vite-Env-Typen).

Der `src/`-Baum wird automatisch gepflegt (Hook-Script `steering-tree.ts`) — der Bereich
zwischen den Markern wird bei Frontend-Änderungen neu generiert.

<!-- BEGIN: folder-structure (auto-generiert – nicht von Hand editieren) -->

```
frontend/src/  (5 Dateien)
├── components/  (8 Dateien)  — Shared Components
│   └── ui/  (26 Dateien)  — shadcn/ui-Primitives (CLI-generiert, nicht editieren)
├── context/  (1 Datei)  — React-Context-Provider
├── hooks/  (4 Dateien)  — React-Hooks (useX)
├── lib/  (4 Dateien)  — Utilities & Helfer
└── pages/  (5 Dateien)  — Seiten (React Router)
    ├── benutzer/  (2 Dateien)
    │   └── [userId]/  (1 Datei)
    └── todos/  (1 Datei)
```

<!-- END: folder-structure (auto-generiert – nicht von Hand editieren) -->

Wichtige Seiten: `pages/theme-preview.tsx` ist die verbindliche visuelle Referenz des
Design-Systems; `pages/todos/` und `pages/benutzer/` sind die beiden CRUD-UI-Beispiele
(per-user bzw. admin-only).

## Code Style

### General

- Use double quotes for strings.
- Use semicolons.
- Max line width: 100 characters.
- Trailing commas everywhere.
- Use `type` keyword instead of `interface` for TypeScript type definitions.
- Use type imports (`import type { X } from "y"`) separated from value imports.
- Unused variables prefixed with `_` are allowed; others trigger warnings.

### React Components

- Always use Function Components (no class components).
- File extension: `.tsx` for components (JSX), `.ts` for pure functions/utilities.
- Destructure props as TypeScript type (no `React.FC<Props>` wrapper).
- Props type definition:
  ```typescript
  type Props = {
    label: string;
    onClick?: () => void;
  };

  export default function MyComponent({ label, onClick }: Props) {
    return <button onClick={onClick}>{label}</button>;
  }
  ```
- No `defaultProps` — use destructuring defaults instead:
  ```typescript
  type Props = { count?: number };
  export default function Counter({ count = 0 }: Props) { ... }
  ```

### Hooks

- Name all custom hooks with `useX` pattern (`useAuth.ts`, `useToast.ts`).
- Custom hooks can use standard React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`).
- Context hooks (`useToast`) throw if used outside their provider.

### Imports

- Sorted alphabetically by eslint-plugin-perfectionist (natural sort).
- Grouped: external packages → internal (`@/`) → relative (`.`).
- Blank line between groups.

### Naming

- Components: PascalCase filenames (`MyComponent.tsx`).
- Hooks: `useX` pattern (`useAuth.ts`, `useToast.ts`).
- Context files: `XContext.tsx` (e.g., `ToastContext.tsx`).
- Types: PascalCase, exported from `types/` or co-located.
- Pages: kebab-case for route segments (`benutzer/[userId]/edit.tsx` → `/benutzer/:userId/edit`).
- Utilities: camelCase functions in `lib/`.

### Styling

- Use TailwindCSS utility classes exclusively — no custom CSS unless unavoidable.
- Use shadcn/ui components as building blocks; customize via props and `className` prop.
- Design tokens (colors, radius, etc.) defined as CSS variables in `style.css`.
- Always use theme tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `text-primary`, etc.) — never hardcode color values like `bg-neutral-950` or `text-white`.
- When unsure whether a new UI element fits the styleguide, check `src/pages/theme-preview.tsx` as the authoritative visual reference for the design system.

### Design Tokens (Dark-First)

- The app runs in **dark-first mode** by default — no `.dark` class toggle required.
- Theme tokens are defined in `src/style.css` `:root` block and automatically available via Tailwind.
- shadcn/ui tokens are mapped to the dark-first palette.
- Always use the semantic token names in Tailwind classes, never hardcode hex values or single-letter color utilities.

## Shared Components & Hooks

### Navbar

- **Location**: `src/components/Navbar.tsx`.
- Sticky top navigation with blur backdrop, brand mark, nav links, and user menu.
- Uses `useAuth()` hook to access session state; respects `session.isPending` and `session.data?.user?.email`.
- Uses `useNavigate()` from React Router for programmatic navigation.

### AppBreadcrumb

- **Location**: `src/components/AppBreadcrumb.tsx`.
- **Props**: `crumbs: { label: string; href?: string }[]`.
- Crumbs with `href` render as `<Link>` components; the last crumb (or any without `href`) is static text.

### PageHeader

- **Location**: `src/components/PageHeader.tsx`.
- Props: title, subtitle, optional `leading` icon, optional `actions` (e.g. a `CreateButton`).

### AppToast

- **Location**: `src/components/AppToast.tsx` + `src/context/ToastContext.tsx` + `src/hooks/useToast.ts`.
- **Global Mount**: Already mounted in `App.tsx` via `<ToastProvider>`; no per-page setup required.
- **Usage**:
  ```typescript
  import { useToast } from "@/hooks/useToast";
  const { showToast } = useToast();
  showToast("Operation successful!"); // auto-dismisses in 2.5s by default
  ```
- Renders via `createPortal(..., document.body)` bottom-center, stacked if multiple toasts.
- Always use for user feedback (save confirmations, errors, etc.) instead of custom notifications.

### DList & DListRow

- **Location**: `src/components/DList.tsx` + `src/components/DListRow.tsx`.
- **Usage**: Card-based table pattern (data grids, lists of records).
  ```typescript
  <DList head={<DListRow head className="text-muted-foreground"><div>Name</div></DListRow>}>
    {items.map((item) => (
      <DListRow key={item.id} href={`/item/${item.id}`}>
        <div>{item.name}</div>
      </DListRow>
    ))}
  </DList>
  ```
- `DListRow` accepts optional `href` prop to render as a `<Link>` (clickable card row).
- `head` prop (`true` or omitted) renders header row without card styling.

## Wiederverwendbare Components

Dieses Kapitel wird automatisch gepflegt (Stop-Hook `update-steering.sh`).
Es listet die wiederverwendbaren Shared Components aus `frontend/src/components/`
(Top-Level, ohne generiertes `ui/`) mit je einem Satz, damit sie bei neuen Features
bevorzugt wiederverwendet statt neu gebaut werden. Der Bereich zwischen den Markern
wird bei Frontend-Änderungen neu generiert — außerhalb der Marker von Hand
geschriebene Inhalte bleiben unangetastet.

<!-- BEGIN: reusable-components (auto-generiert – nicht von Hand editieren) -->

| Component | Zweck (1 Satz) | Wiederverwenden für |
|-----------|-------|---------|
| **AppBreadcrumb** | Breadcrumb-Navigation; Crumbs mit `href` rendern als `<Link>`, der letzte als statischer Text. | Kontextnavigation auf Detail- und verschachtelten Seiten. |
| **AppLogo** | Brand-Mark der App. | Logo-Anzeige in Landing-Pages, Modal-Headern und Formularen. |
| **AppToast** | Globale Toast-Benachrichtigungen (Bottom-Center via Portal, stapelbar, Auto-Dismiss). | Erfolgs-/Fehler-Rückmeldungen und Bestätigungen über `useToast()`. |
| **CreateButton** | Runder „+"-Button, der zu einer Formular-Route navigiert. | „Neu erstellen"-Action oben rechts (über `PageHeader actions`) in Listen-Seiten. |
| **DList** | Container für Card-basierte Listen mit optionaler Kopfzeile. | Daten-Grids und strukturierte Listen von Datensätzen. |
| **DListRow** | Einzelne Card-Zeile in DList, optional als Link-Zeile oder statische Kopfzeile. | Tabellarische Einträge mit Klick-Navigation oder Header-Rows. |
| **Navbar** | Sticky Top-Navigation mit Blur-Backdrop, Brand-Mark, Nav-Links und User-Menü. | App-weite Top-Navigation (nicht duplizieren). |
| **PageHeader** | Seitenkopf mit Titel, Untertitel, optionalem Leading-Icon und Actions-Slot. | Einheitlicher Kopf für Listen- und Detailseiten. |

<!-- END: reusable-components (auto-generiert – nicht von Hand editieren) -->

## State Management

- Start with local component state (`useState`) and lift it up where needed.
- For cross-tree shared state, use a React Context provider (see `ToastContext`).
- API access lives in `src/lib/<resource>.ts` helpers (`listX`, `findX`, `createX`, …), never inline in pages.

### Local Hooks

- `useAuth`: Wraps `authClient.useSession()` from `better-auth/react`; exposes `{ session, signInWithEmail, signOut }`.
- `useMediaQuery`: Custom hook using the `matchMedia` API.
- `useWindowScroll`: Custom hook using a scroll event listener.

## Routing

- **Router Config**: `src/router.tsx` with `createBrowserRouter`.
- **Manual Routes**: All routes defined explicitly (no file-based auto-routing).
- **URL Structure**:
  - Public: `/`, `/login`, `/impressum`, `/theme-preview`
  - Protected (`AuthGuard`): `/profil`, `/todos`
  - Admin-only (`AdminGuard`): `/benutzer`, `/benutzer/new`, `/benutzer/:userId/edit`
- **AuthGuard**: Wrapper component checks `useAuth().session.isPending` and `session.data`, redirects to `/login` if not authenticated.
- **AdminGuard**: nested under `AuthGuard`; checks `session.data?.user?.role === "admin"`.
- **ScrollRestoration**: Built-in `<ScrollRestoration/>` in root layout handles scroll position across navigations.
- **Programmatic Navigation**: Use `useNavigate()` hook from React Router.
- **Links**: Use `<Link to="...">` from React Router (not `<a>` tags).

## Listen- & Formular-Pattern (CRUD-UI)

Create/Edit-Operationen erfolgen **immer über eigene Routen**, nie über Modale/Dialoge.
Ein „+"-Button oben rechts navigiert zu einer separaten Formularseite mit eigenem Back-Button.
Modale (`AlertDialog`/`Dialog`) sind ausschließlich Bestätigungen (z. B. Löschen) vorbehalten —
niemals Create/Edit-Formulare.

Das ist die verbindliche Default-Struktur für jede Listen-/CRUD-Seite in dieser App.

### Routen-Struktur

Pro Ressource (z. B. `benutzer`) drei Routen, alle unter dem jeweiligen Guard:

```ts
{ path: "/benutzer", element: <BenutzerListPage /> },
{ path: "/benutzer/new", element: <BenutzerNewPage /> },
{ path: "/benutzer/:userId/edit", element: <BenutzerEditPage /> },
```

Datei-Layout entsprechend (Folder pro Ressource, dynamische Segmente in `[...]`):

```
src/pages/benutzer/
├── index.tsx              # Liste
├── new.tsx                # Create-Formular
└── [userId]/
    └── edit.tsx           # Edit-Formular
```

### Listenseite

- `Navbar` + `AppBreadcrumb` + `PageHeader`.
- „+"-Button oben rechts via `actions={<CreateButton to="/<resource>/new" tooltipText="…" />}`.
- Zeilen-Aktion „Bearbeiten" navigiert zur Edit-Route (`navigate("/<resource>/<id>/edit")`).
- Direkte Status-Toggles (z. B. Aktivieren/Deaktivieren) dürfen inline auf der Liste bleiben.

### Formularseite (Create/Edit)

- Eigene Route, **`Navbar`** (jede Top-Level-Seite rendert die Navbar selbst), `AppBreadcrumb` mit
  Eltern-Crumb + aktuellem Schritt.
- `PageHeader` mit `leading`-Icon, Titel und Subtitle.
- Formular in `bg-card rounded-2xl border`-Karte; Felder im `grid md:grid-cols-[12rem_1fr]`-Raster.
- **Sticky Footer**: Back-Button (`ChevronLeft`, zurück zur Liste) links, Save-Button rechts;
  der Submit-Button referenziert das Form via `form="<id>"` (Formular und Footer sind separate Blöcke).
- Nach erfolgreichem Speichern: `showToast(...)` + `navigate("/<resource>")`.

### Kanonische Referenz-Beispiele

Bevor eine neue CRUD-Seite gebaut wird, als Vorlage kopieren:

- **Einfache Liste mit Inline-Create** (eine Ressource in `app.db`, per-User): `src/pages/todos/index.tsx`
- **Liste**: `src/pages/benutzer/index.tsx`
- **Create**: `src/pages/benutzer/new.tsx`
- **Edit**: `src/pages/benutzer/[userId]/edit.tsx`

### Wiederverwendbare Bausteine

- `CreateButton` (`src/components/CreateButton.tsx`) — der runde „+"-Button (oben rechts über
  `PageHeader actions`). Props: `to`, `tooltipText`.
- `PageHeader` (`src/components/PageHeader.tsx`) — Titel/Subtitle/`leading`/`actions`.
- API-Logik pro Ressource in `src/lib/<resource>.ts` (`listX`, `findX`, `createX`, `updateX`, …)
  — analog `src/lib/users.ts` und `src/lib/todos.ts` — nicht inline in den Seiten.

### Anti-Pattern

- Keine `AlertDialog`/`Dialog` für Create/Edit-Formulare (nur für Bestätigungen).
- Keine Form-State in der Listenseite (`mode`/`editingId`/`open`) — das übernimmt die Route.
- Keine fetch-Helper inline in Seiten — in `lib/` auslagern.

## Inline Comments

- Do not add obvious comments (e.g., `// import React`).
- Add comments only for non-obvious logic, workarounds, or business rules.
- Use `// TODO:` for planned improvements.
- Use `// HACK:` for temporary workarounds that need revisiting.

## Error Handling

- Use React Error Boundaries (if added) or local error state for UI errors.
- API errors should be handled at the hook/lib level and surfaced to the user via toast or local state.
- Hooks can throw if invariants are violated (e.g., a context hook used outside its provider).

## Testing

- Unit tests with Vitest.
- Component tests with @testing-library/react.
- Place tests in `__tests__/` directories next to the code they test or co-located with `*.test.tsx`.
- No snapshots — test behavior and output.
