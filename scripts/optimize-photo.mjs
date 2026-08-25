import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import sharp from "sharp"

const root = process.cwd()
const source = resolve(root, "photo.png")
const publicDir = resolve(root, "public")
const output = resolve(publicDir, "photo.webp")

await mkdir(publicDir, { recursive: true })
await sharp(source)
  .resize({ width: 768, height: 768, fit: "cover", position: "centre" })
  .webp({ quality: 82, effort: 4 })
  .toFile(output)

console.log(`Generated optimized portrait: ${output}`)
