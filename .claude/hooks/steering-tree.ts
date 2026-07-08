#!/usr/bin/env bun
// Deterministic folder-tree generator (no LLM).
// Builds a compact directory tree from `git ls-files <side>/src` (thereby
// respecting .gitignore) with file counters + static folder labels and writes
// it between the folder-structure markers in the respective steering doc.
//
// Usage: bun .claude/hooks/steering-tree.ts <frontend|backend>

import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..", "..");

type SideConfig = {
  root: string; // path relative to the repo whose tree is generated
  doc: string; // steering doc relative to the repo
  annotations: Record<string, string>; // full path -> label
  collapse: string[]; // folders that are not expanded (total count only)
};

const CONFIG: Record<string, SideConfig> = {
  frontend: {
    root: "frontend/src",
    doc: ".claude/steering/frontend.md",
    collapse: ["frontend/src/components/ui"],
    annotations: {
      "frontend/src/components": "Shared components",
      "frontend/src/components/ui": "shadcn/ui primitives (CLI-generated, do not edit)",
      "frontend/src/context": "React context providers",
      "frontend/src/hooks": "React hooks (useX)",
      "frontend/src/lib": "Utilities & helpers",
      "frontend/src/pages": "Pages (React Router)",
    },
  },
  backend: {
    root: "backend/src",
    doc: ".claude/steering/backend.md",
    collapse: [],
    annotations: {
      "backend/src/lib": "Shared config & utilities",
      "backend/src/routes": "Route modules (one Hono instance each)",
      "backend/src/middleware": "Custom middleware",
    },
  },
};

const side = process.argv[2];
const cfg = CONFIG[side ?? ""];
if (!cfg) {
  console.error(`Unknown side: ${side}. Allowed: frontend | backend`);
  process.exit(1);
}

const MARKER_BEGIN = "<!-- BEGIN: folder-structure (auto-generated — do not edit by hand) -->";
const MARKER_END = "<!-- END: folder-structure (auto-generated — do not edit by hand) -->";

// --- Collect files (tracked only -> respects .gitignore) --------------------
const proc = Bun.spawnSync(["git", "ls-files", cfg.root], { cwd: repoRoot });
if (!proc.success) {
  console.error(`git ls-files failed for ${cfg.root}`);
  process.exit(1);
}
const files = new TextDecoder()
  .decode(proc.stdout)
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

if (files.length === 0) {
  console.error(`No tracked files under ${cfg.root} — skipping.`);
  process.exit(0);
}

// --- Build tree --------------------------------------------------------------
type Node = { dirs: Map<string, Node>; files: number };
const emptyNode = (): Node => ({ dirs: new Map(), files: 0 });
const root = emptyNode();

for (const path of files) {
  const rel = path.slice(cfg.root.length + 1); // relative to root
  const segs = rel.split("/");
  let node = root;
  for (let i = 0; i < segs.length - 1; i++) {
    const d = segs[i];
    if (!node.dirs.has(d)) node.dirs.set(d, emptyNode());
    node = node.dirs.get(d)!;
  }
  node.files++;
}

// --- Render ------------------------------------------------------------------
const count = (n: number) => (n > 0 ? `  (${n} ${n === 1 ? "file" : "files"})` : "");
// recursive total of all files under a node (for collapsed folders)
const totalFiles = (node: Node): number =>
  node.files + [...node.dirs.values()].reduce((sum, d) => sum + totalFiles(d), 0);

const collapse = new Set(cfg.collapse);
const lines: string[] = [`${cfg.root}/${count(root.files)}`];

const walk = (node: Node, prefix: string, pathSoFar: string) => {
  const names = [...node.dirs.keys()].sort((a, b) => a.localeCompare(b));
  names.forEach((name, idx) => {
    const child = node.dirs.get(name)!;
    const last = idx === names.length - 1;
    const glyph = last ? "└── " : "├── ";
    const fullPath = `${pathSoFar}/${name}`;
    const ann = cfg.annotations[fullPath];
    const isCollapsed = collapse.has(fullPath);
    // Collapsed folders: show the recursive total, but don't expand.
    const shown = isCollapsed ? totalFiles(child) : child.files;
    lines.push(prefix + glyph + name + "/" + count(shown) + (ann ? `  — ${ann}` : ""));
    if (!isCollapsed) walk(child, prefix + (last ? "    " : "│   "), fullPath);
  });
};
walk(root, "", cfg.root);

const tree = "```\n" + lines.join("\n") + "\n```";

// --- Insert into doc between markers ----------------------------------------
const docPath = resolve(repoRoot, cfg.doc);
const original = await Bun.file(docPath).text();
const begin = original.indexOf(MARKER_BEGIN);
const end = original.indexOf(MARKER_END);
if (begin === -1 || end === -1 || end < begin) {
  console.error(`folder-structure markers not found in ${cfg.doc} — skipping.`);
  process.exit(0);
}

const before = original.slice(0, begin + MARKER_BEGIN.length);
const after = original.slice(end);
const updated = `${before}\n\n${tree}\n\n${after}`;

if (updated !== original) {
  await Bun.write(docPath, updated);
  console.error(`Updated folder-structure in ${cfg.doc} (${files.length} files).`);
}
