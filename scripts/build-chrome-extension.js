#!/usr/bin/env node
/**
 * Build Chrome Extension package from Vite frontend build
 * - Assumes `npm run build` has produced `dist/`
 * - Copies dist to `extension/` and renames `index.html` → `popup.html`
 * - Keeps manifest, background, and icons in `extension/`
 */

import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '..')
const distDir = path.join(repoRoot, 'dist')
const extDir = path.join(repoRoot, 'extension')

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true })
}

async function copyDir(src, dest) {
  await ensureDir(dest)
  const entries = await fsp.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else if (entry.isFile()) {
      await fsp.copyFile(srcPath, destPath)
    }
  }
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.error('dist/ not found. Run `npm run build` first.')
    process.exit(1)
  }

  // Copy dist into extension root alongside manifest/background
  console.log('Copying dist → extension ...')
  await copyDir(distDir, extDir)

  // Rename index.html to popup.html (Chrome action popup)
  const indexHtml = path.join(extDir, 'index.html')
  const popupHtml = path.join(extDir, 'popup.html')
  if (fs.existsSync(indexHtml)) {
    await fsp.rename(indexHtml, popupHtml)
    console.log('Renamed index.html → popup.html')
  } else if (!fs.existsSync(popupHtml)) {
    console.warn('No index.html found in dist. Ensure Vite output includes index.html')
  }

  // Ensure icons directory exists (placeholder)
  const iconsDir = path.join(extDir, 'icons')
  await ensureDir(iconsDir)
  // Optionally place placeholder icons if none present
  const icon128 = path.join(iconsDir, 'icon128.png')
  if (!fs.existsSync(icon128)) {
    // Minimal 1x1 transparent PNG placeholder
    const emptyPng = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bf0000000049454e44ae426082',
      'hex'
    )
    await fsp.writeFile(path.join(iconsDir, 'icon16.png'), emptyPng)
    await fsp.writeFile(path.join(iconsDir, 'icon48.png'), emptyPng)
    await fsp.writeFile(icon128, emptyPng)
    console.log('Placed placeholder icons in extension/icons/')
  }

  console.log('Chrome extension build prepared in extension/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


