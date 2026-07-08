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

Top level (maintained by hand): `public/` (static assets), `eslint.config.mjs`,
`vite.config.ts`, `tsconfig.json` / `tsconfig.app.json`, `components.json`
(shadcn/ui config), `.prettierrc`. Entry files in `src/`: `main.tsx` (ReactDOM),
`App.tsx` (ToastProvider > RouterProvider), `router.tsx` (React Router v7), `style.css`
(Tailwind + dark-first tokens), `vite-env.d.ts` (Vite env types).

The `src/` tree is maintained automatically (hook script `steering-tree.ts`) — the region
between the markers is regenerated on frontend changes.

<!-- BEGIN: folder-structure (auto-generated — do not edit by hand) -->

```
frontend/src/  (5 files)
├── components/  (8 files)  — Shared components
│   └── ui/  (26 files)  — shadcn/ui primitives (CLI-generated, do not edit)
├── context/  (1 file)  — React context providers
├── hooks/  (4 files)  — React hooks (useX)
├── lib/  (4 files)  — Utilities & helpers
└── pages/  (5 files)  — Pages (React Router)
    ├── todos/  (1 file)
    └── users/  (2 files)
        └── [userId]/  (1 file)
```

<!-- END: folder-structure (auto-generated — do not edit by hand) -->

Key pages: `pages/theme-preview.tsx` is the authoritative visual reference of the
design system; `pages/todos/` and `pages/users/` are the two CRUD-UI examples
(per-user and admin-only, respectively).

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
- Pages: kebab-case for route segments (`users/[userId]/edit.tsx` → `/users/:userId/edit`).
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

## Reusable Components

This chapter is maintained automatically (Stop hook `update-steering.sh`).
It lists the reusable shared components from `frontend/src/components/`
(top level, excluding the generated `ui/`) with one sentence each, so they are
reused for new features instead of being rebuilt. The region between the markers
is regenerated on frontend changes — content written by hand outside the markers
is left untouched.

<!-- BEGIN: reusable-components (auto-generated — do not edit by hand) -->

| Component | Purpose (1 sentence) | Reuse for |
|-----------|-------|---------|
| **AppBreadcrumb** | Breadcrumb navigation with clickable links and a static final crumb. | Contextual navigation on detail and nested pages. |
| **AppLogo** | Brand mark ("R" icon and "Reclaude" text) of the app. | Logo display in landing pages, modal headers, and forms. |
| **AppToast** | Global toast notifications (bottom-center via portal, stackable, auto-dismiss). | Success/error feedback and confirmations via `useToast()`. |
| **CreateButton** | Round "+" button with tooltip that navigates to a form route. | "Create new" action at the top right (via `PageHeader actions`) on list pages. |
| **DList** | Container for card-based lists with an optional header row and vertical spacing. | Data grids and structured lists of records. |
| **DListRow** | Single card row inside DList, optionally as a clickable link row or static header. | Tabular entries with click navigation or header rows. |
| **Navbar** | Sticky top navigation with blur backdrop, brand mark, nav links, and user menu. | App-wide top navigation (do not duplicate). |
| **PageHeader** | Page header with eyebrow label, title, subtitle, optional leading icon, and actions slot. | Consistent header for list and detail pages. |

<!-- END: reusable-components (auto-generated — do not edit by hand) -->

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
  - Public: `/`, `/login`, `/imprint`, `/theme-preview`
  - Protected (`AuthGuard`): `/profile`, `/todos`
  - Admin-only (`AdminGuard`): `/users`, `/users/new`, `/users/:userId/edit`
- **AuthGuard**: Wrapper component checks `useAuth().session.isPending` and `session.data`, redirects to `/login` if not authenticated.
- **AdminGuard**: nested under `AuthGuard`; checks `session.data?.user?.role === "admin"`.
- **ScrollRestoration**: Built-in `<ScrollRestoration/>` in root layout handles scroll position across navigations.
- **Programmatic Navigation**: Use `useNavigate()` hook from React Router.
- **Links**: Use `<Link to="...">` from React Router (not `<a>` tags).

## List & Form Pattern (CRUD UI)

Create/edit operations **always use dedicated routes**, never modals/dialogs.
A "+" button at the top right navigates to a separate form page with its own back button.
Modals (`AlertDialog`/`Dialog`) are reserved exclusively for confirmations (e.g. delete) —
never for create/edit forms.

This is the mandatory default structure for every list/CRUD page in this app.

### Route Structure

Per resource (e.g. `users`) three routes, all under the respective guard:

```ts
{ path: "/users", element: <UserListPage /> },
{ path: "/users/new", element: <UserNewPage /> },
{ path: "/users/:userId/edit", element: <UserEditPage /> },
```

File layout to match (one folder per resource, dynamic segments in `[...]`):

```
src/pages/users/
├── index.tsx              # List
├── new.tsx                # Create form
└── [userId]/
    └── edit.tsx           # Edit form
```

### List Page

- `Navbar` + `AppBreadcrumb` + `PageHeader`.
- "+" button at the top right via `actions={<CreateButton to="/<resource>/new" tooltipText="…" />}`.
- Row action "Edit" navigates to the edit route (`navigate("/<resource>/<id>/edit")`).
- Direct status toggles (e.g. activate/deactivate) may stay inline on the list.

### Form Page (Create/Edit)

- Dedicated route, **`Navbar`** (every top-level page renders the navbar itself), `AppBreadcrumb`
  with parent crumb + current step.
- `PageHeader` with `leading` icon, title, and subtitle.
- Form inside a `bg-card rounded-2xl border` card; fields in a `grid md:grid-cols-[12rem_1fr]` grid.
- **Sticky footer**: back button (`ChevronLeft`, back to the list) on the left, save button on the
  right; the submit button references the form via `form="<id>"` (form and footer are separate blocks).
- After a successful save: `showToast(...)` + `navigate("/<resource>")`.

### Canonical Reference Examples

Before building a new CRUD page, copy one of these as a template:

- **Simple list with inline create** (one resource in `app.db`, per-user): `src/pages/todos/index.tsx`
- **List**: `src/pages/users/index.tsx`
- **Create**: `src/pages/users/new.tsx`
- **Edit**: `src/pages/users/[userId]/edit.tsx`

### Reusable Building Blocks

- `CreateButton` (`src/components/CreateButton.tsx`) — the round "+" button (top right via
  `PageHeader actions`). Props: `to`, `tooltipText`.
- `PageHeader` (`src/components/PageHeader.tsx`) — title/subtitle/`leading`/`actions`.
- API logic per resource in `src/lib/<resource>.ts` (`listX`, `findX`, `createX`, `updateX`, …)
  — following `src/lib/users.ts` and `src/lib/todos.ts` — never inline in pages.

### Anti-Patterns

- No `AlertDialog`/`Dialog` for create/edit forms (confirmations only).
- No form state on the list page (`mode`/`editingId`/`open`) — the route handles that.
- No fetch helpers inline in pages — extract them to `lib/`.

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
