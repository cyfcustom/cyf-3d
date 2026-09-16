import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import { existsSync, lstatSync, mkdirSync, writeFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/**
 * Ensures `public/modelos` exists before Vite copies the publicDir.
 *
 * Why this plugin exists:
 * - Locally, `public/modelos` is a symlink to `../modelos` (which is
 *   gitignored). The symlink resolves and the build copies the real GLBs.
 * - On Vercel (and any environment that clones without the ignored
 *   directory), the symlink's target is missing, so `statSync('public/modelos')`
 *   throws ENOENT during `prepareOutDir` and the build crashes.
 *
 * Behaviour:
 * - If `public/modelos` already exists (including a symlink to the real
 *   folder locally), do nothing — `lstatSync` succeeds and we return early.
 * - Otherwise, create an empty directory with a `.gitkeep` so the publicDir
 *   copy step finds a valid entry and the build succeeds. No GLBs are ever
 *   committed; production will simply serve no models from `/modelos` until
 *   they are hosted elsewhere.
 */
function ensureModelosDir(): Plugin {
  return {
    name: 'ensure-modelos-dir',
    configResolved() {
      const target = path.resolve(__dirname, 'public/modelos')
      try {
        lstatSync(target)
        return
      } catch {
        // entry is missing — fall through and create a placeholder
      }
      mkdirSync(target, { recursive: true })
      const gitkeep = path.resolve(target, '.gitkeep')
      if (!existsSync(gitkeep)) {
        writeFileSync(gitkeep, '')
      }
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    ensureModelosDir(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
