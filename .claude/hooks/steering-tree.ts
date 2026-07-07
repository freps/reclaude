#!/usr/bin/env bun
// Deterministischer Verzeichnisbaum-Generator (kein LLM).
// Erzeugt aus `git ls-files <side>/src` (respektiert damit .gitignore) einen
// kompakten Verzeichnisbaum mit Datei-Zählern + statischen Ordner-Labels und
// schreibt ihn zwischen die folder-structure-Marker im jeweiligen Steering-Doc.
//
// Aufruf: bun .claude/hooks/steering-tree.ts <frontend|backend>

import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..", "..");

type SideConfig = {
  root: string; // Pfad relativ zum Repo, dessen Baum generiert wird
  doc: string; // Steering-Doc relativ zum Repo
  annotations: Record<string, string>; // voller Pfad -> Label
  collapse: string[]; // Ordner, die nicht aufgeklappt werden (nur Gesamtzahl)
};

const CONFIG: Record<string, SideConfig> = {
  frontend: {
    root: "frontend/src",
    doc: ".claude/steering/frontend.md",
    collapse: ["frontend/src/components/ui"],
    annotations: {
      "frontend/src/components": "Shared Components",
      "frontend/src/components/ui": "shadcn/ui-Primitives (CLI-generiert, nicht editieren)",
      "frontend/src/context": "React-Context-Provider",
      "frontend/src/hooks": "React-Hooks (useX)",
      "frontend/src/lib": "Utilities & Helfer",
      "frontend/src/pages": "Seiten (React Router)",
    },
  },
  backend: {
    root: "backend/src",
    doc: ".claude/steering/backend.md",
    collapse: [],
    annotations: {
      "backend/src/lib": "Shared Config & Utilities",
      "backend/src/routes": "Route-Module (je eine Hono-Instanz)",
      "backend/src/middleware": "Custom Middleware",
    },
  },
};

const side = process.argv[2];
const cfg = CONFIG[side ?? ""];
if (!cfg) {
  console.error(`Unbekannte Seite: ${side}. Erlaubt: frontend | backend`);
  process.exit(1);
}

const MARKER_BEGIN = "<!-- BEGIN: folder-structure (auto-generiert – nicht von Hand editieren) -->";
const MARKER_END = "<!-- END: folder-structure (auto-generiert – nicht von Hand editieren) -->";

// --- Dateien holen (nur getrackte -> .gitignore respektiert) ---------------
const proc = Bun.spawnSync(["git", "ls-files", cfg.root], { cwd: repoRoot });
if (!proc.success) {
  console.error(`git ls-files fehlgeschlagen für ${cfg.root}`);
  process.exit(1);
}
const files = new TextDecoder()
  .decode(proc.stdout)
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

if (files.length === 0) {
  console.error(`Keine getrackten Dateien unter ${cfg.root} — überspringe.`);
  process.exit(0);
}

// --- Baum aufbauen ---------------------------------------------------------
type Node = { dirs: Map<string, Node>; files: number };
const emptyNode = (): Node => ({ dirs: new Map(), files: 0 });
const root = emptyNode();

for (const path of files) {
  const rel = path.slice(cfg.root.length + 1); // relativ zum root
  const segs = rel.split("/");
  let node = root;
  for (let i = 0; i < segs.length - 1; i++) {
    const d = segs[i];
    if (!node.dirs.has(d)) node.dirs.set(d, emptyNode());
    node = node.dirs.get(d)!;
  }
  node.files++;
}

// --- Rendern ---------------------------------------------------------------
const count = (n: number) => (n > 0 ? `  (${n} ${n === 1 ? "Datei" : "Dateien"})` : "");
// rekursive Gesamtzahl aller Dateien unter einem Knoten (für Collapse-Ordner)
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
    // Collapse-Ordner: rekursive Gesamtzahl zeigen, aber nicht aufklappen.
    const shown = isCollapsed ? totalFiles(child) : child.files;
    lines.push(prefix + glyph + name + "/" + count(shown) + (ann ? `  — ${ann}` : ""));
    if (!isCollapsed) walk(child, prefix + (last ? "    " : "│   "), fullPath);
  });
};
walk(root, "", cfg.root);

const tree = "```\n" + lines.join("\n") + "\n```";

// --- In Doc zwischen Markern einsetzen -------------------------------------
const docPath = resolve(repoRoot, cfg.doc);
const original = await Bun.file(docPath).text();
const begin = original.indexOf(MARKER_BEGIN);
const end = original.indexOf(MARKER_END);
if (begin === -1 || end === -1 || end < begin) {
  console.error(`folder-structure-Marker in ${cfg.doc} nicht gefunden — überspringe.`);
  process.exit(0);
}

const before = original.slice(0, begin + MARKER_BEGIN.length);
const after = original.slice(end);
const updated = `${before}\n\n${tree}\n\n${after}`;

if (updated !== original) {
  await Bun.write(docPath, updated);
  console.error(`folder-structure in ${cfg.doc} aktualisiert (${files.length} Dateien).`);
}
