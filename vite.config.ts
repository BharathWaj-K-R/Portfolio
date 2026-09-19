import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "clean-package-lock-artifacts",
      closeBundle() {
        const assetsDir = path.resolve(__dirname, "dist/assets")
        if (!fs.existsSync(assetsDir)) return

        for (const filename of fs.readdirSync(assetsDir)) {
          if (/^package-lock.*\.json$/i.test(filename)) {
            fs.rmSync(path.join(assetsDir, filename), { force: true })
          }
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: true,
  },
})
