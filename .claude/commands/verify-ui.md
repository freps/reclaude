---
description: Verify a UI feature by navigating the running app with Chrome DevTools MCP
argument-hint: [what to verify, e.g. "todos page adds and toggles an item"]
---

Verify that the following works correctly in the running app: $ARGUMENTS

Uses the **Chrome DevTools MCP** (`mcp__chrome-devtools__*`) for all browser interaction.

## Before opening the browser

1. Run `find frontend/src/pages -name "*.tsx" | sort` and read `frontend/src/router.tsx` to understand the route structure (routes are defined manually in `router.tsx`; pages mirror the URL: `pages/foo/[id]/bar.tsx` → `/foo/:id/bar`).
2. Read `backend/.env` for login credentials (`SEED_USER_EMAIL`, `SEED_USER_PASSWORD`).
3. Read the relevant component/page file to know what to look for.

## Non-obvious quirks

**React controlled inputs**: Setting `input.value` directly does not update React state. Use the native value setter, then dispatch an input event:

```js
const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
setter.call(input, "some text");
input.dispatchEvent(new Event("input", { bubbles: true }));
```

**`take_snapshot` is unreliable** on this app. Use `evaluate_script` for all interactions (clicks, form fills, reading DOM). Use `take_screenshot` for visual confirmation.
