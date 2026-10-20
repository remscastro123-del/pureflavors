// Serves a COPY of the static export, so `npm run build` (which deletes and rewrites out/) never pulls
// the files out from under a running server.
//   npm run preview         → copy out/ to .preview/ and serve it on http://localhost:3119
//   npm run preview:sync    → copy only (refresh a preview server that's already running)
//
// The copy is done file by file into the existing .preview/ folder (then stale files are removed).
// Windows won't rename or replace a folder while a running server holds it open, so no folder swaps.
import { access, copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "out");
const dest = path.join(root, ".preview");
const portArg = process.argv.indexOf("--port");
const port = (portArg > -1 && process.argv[portArg + 1]) || process.env.PREVIEW_PORT || "3119";

try {
  await access(path.join(src, "index.html"));
} catch {
  console.error("No build found in out/. Run `npm run build` first.");
  process.exit(1);
}

/** All file paths under dir, relative to dir. */
async function list(dir, base = dir) {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await list(full, base)));
    else out.push(path.relative(base, full));
  }
  return out;
}

async function retry(fn, tries = 5) {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= tries - 1 || !["EPERM", "EBUSY", "EACCES"].includes(err.code)) throw err;
      await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
  }
}

const started = Date.now();
const [srcFiles, destFiles] = await Promise.all([list(src), list(dest)]);
const keep = new Set(srcFiles);
let copied = 0;
let skipped = 0;

// 1. Copy new and changed files in place (unchanged files are left alone, so most of .preview/ is untouched).
for (const rel of srcFiles) {
  const from = path.join(src, rel);
  const to = path.join(dest, rel);
  const [a, b] = await Promise.all([stat(from), stat(to).catch(() => null)]);
  if (b && a.size === b.size && a.mtimeMs <= b.mtimeMs) {
    skipped++;
    continue;
  }
  await mkdir(path.dirname(to), { recursive: true });
  await retry(() => copyFile(from, to));
  copied++;
}

// 2. Remove files that no longer exist in the build. A file held open right now is left for the next sync.
let removed = 0;
let held = 0;
for (const rel of destFiles) {
  if (keep.has(rel)) continue;
  try {
    await retry(() => rm(path.join(dest, rel), { force: true }), 3);
    removed++;
  } catch {
    held++;
  }
}

console.log(
  `Preview updated from out/ → .preview/: ${copied} copied, ${skipped} unchanged, ${removed} removed${held ? `, ${held} in use (left for next sync)` : ""} in ${Date.now() - started} ms`,
);

if (process.argv.includes("--sync")) process.exit(0);

if (!/^\d{2,5}$/.test(port)) throw new Error(`Invalid port: ${port}`);
console.log(`Serving .preview/ on http://localhost:${port}  (Ctrl+C to stop)`);
const child = spawn(`npx -y serve@14.2.4 .preview -l ${port} --no-clipboard`, { cwd: root, stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
