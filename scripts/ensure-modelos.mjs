// Ensures `public/modelos` exists as a real directory before `vite build`
// runs. This is a defensive `prebuild` step that runs before any Vite plugin
// hook, so it cannot race with `prepareOutDir`.
//
// Context:
//   - Locally, `public/modelos` is a symlink to `../modelos` (gitignored).
//     lstatSync sees the symlink and we leave it alone — the real GLBs are
//     copied into the build output.
//   - On Vercel / any CI that clones without the ignored target, the symlink
//     is missing, so Vite's `prepareOutDir` calls `statSync('public/modelos')`
//     and crashes with ENOENT. We create an empty placeholder so the build
//     passes; production simply has no /modelos assets until they are hosted
//     elsewhere (e.g. Supabase Storage / R2 / S3).
//
// No GLB files are ever committed by this script.

import { existsSync, lstatSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..')
const target = resolve(repoRoot, 'public', 'modelos')

try {
  lstatSync(target)
  console.log('[ensure-modelos] public/modelos already exists. Leaving it alone.')
  process.exit(0)
} catch {
  // entry is missing — fall through
}

mkdirSync(target, { recursive: true })
const gitkeep = resolve(target, '.gitkeep')
if (!existsSync(gitkeep)) {
  writeFileSync(gitkeep, '')
}
console.log('[ensure-modelos] Created empty placeholder at public/modelos for this build.')
