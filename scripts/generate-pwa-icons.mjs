import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const src = path.join(root, "public", "logo.png")
const outDir = path.join(root, "public", "icons")

await fs.mkdir(outDir, { recursive: true })

const input = await sharp(src).ensureAlpha().png()

await input
  .clone()
  .resize(192, 192, { fit: "cover", position: "centre" })
  .toFile(path.join(outDir, "icon-192.png"))

await input
  .clone()
  .resize(512, 512, { fit: "cover", position: "centre" })
  .toFile(path.join(outDir, "icon-512.png"))

const maskableSize = 512
const pad = Math.round(maskableSize * 0.1)
const inner = maskableSize - pad * 2
await input
  .clone()
  .resize(inner, inner, { fit: "contain", position: "centre", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: pad,
    bottom: pad,
    left: pad,
    right: pad,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(path.join(outDir, "icon-maskable-512.png"))

await input
  .clone()
  .resize(180, 180, { fit: "cover", position: "centre" })
  .toFile(path.join(outDir, "apple-touch-icon.png"))

await input
  .clone()
  .resize(32, 32, { fit: "cover", position: "centre" })
  .toFile(path.join(outDir, "favicon-32.png"))

await input
  .clone()
  .resize(16, 16, { fit: "cover", position: "centre" })
  .toFile(path.join(outDir, "favicon-16.png"))

console.log("Wrote PWA icons to public/icons/")
