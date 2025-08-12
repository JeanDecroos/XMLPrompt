#!/usr/bin/env node

// Daily verifier for promptme.md consistency
// - Checks dependency versions against package.json files
// - Validates line counts for key files mentioned in the doc
// - Ensures supported models count matches claims

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

function readText(absPath) {
  return fs.readFileSync(absPath, 'utf8')
}

function fileLines(absPath) {
  if (!fs.existsSync(absPath)) return null
  return readText(absPath).split('\n').length
}

function normalizeVersion(v) {
  if (!v) return v
  return String(v).replace(/^\^|^~|^>=?\s*/g, '')
}

function add(checks, ok, message, details = {}) {
  checks.push({ ok, message, details })
}

async function main() {
  const checks = []

  // Load promptme.md
  const promptmePath = path.join(repoRoot, 'promptme.md')
  if (!fs.existsSync(promptmePath)) {
    console.error('promptme.md not found')
    process.exit(2)
  }
  const md = readText(promptmePath)

  // Load package.json files
  const rootPkgPath = path.join(repoRoot, 'package.json')
  const backendPkgPath = path.join(repoRoot, 'backend', 'package.json')
  const rootPkg = JSON.parse(readText(rootPkgPath))
  const backendPkg = JSON.parse(readText(backendPkgPath))

  // Frontend dependency version checks (ensure the strings appear in promptme.md)
  const feDeps = {
    'React': normalizeVersion(rootPkg.dependencies?.react),
    'Vite': normalizeVersion(rootPkg.devDependencies?.vite),
    'TailwindCSS': normalizeVersion(rootPkg.devDependencies?.tailwindcss),
    'React Router DOM': normalizeVersion(rootPkg.dependencies?.['react-router-dom']),
    'Lucide React': normalizeVersion(rootPkg.dependencies?.['lucide-react']),
    'Supabase JS': normalizeVersion(rootPkg.dependencies?.['@supabase/supabase-js'])
  }

  for (const [label, version] of Object.entries(feDeps)) {
    if (!version) continue
    const expectedSnippet = `${label} ${version}`
    const ok = md.includes(expectedSnippet)
    add(checks, ok, `Frontend dep version for ${label} (${version}) present in promptme.md`, { expectedSnippet })
  }

  // Backend dependency version checks
  const beDeps = {
    'Express.js': normalizeVersion(backendPkg.dependencies?.express),
    'Winston': normalizeVersion(backendPkg.dependencies?.winston),
    'Joi': normalizeVersion(backendPkg.dependencies?.joi)
  }
  for (const [label, version] of Object.entries(beDeps)) {
    if (!version) continue
    const baseLabel = label.replace('.js', '') // simple normalization for matching lines
    const ok = md.includes(`${baseLabel} ${version}`) || md.includes(`${label} ${version}`)
    add(checks, ok, `Backend dep version for ${label} (${version}) present in promptme.md`)
  }

  // Line count checks for key files (doc claims vs actual)
  const filesToCheck = [
    {
      mdPattern: /SimplifiedPromptGenerator\.jsx[^\n]*?-\s*(\d+)\s*lines/i,
      path: path.join(repoRoot, 'src', 'components', 'SimplifiedPromptGenerator.jsx'),
      label: 'SimplifiedPromptGenerator.jsx'
    },
    {
      mdPattern: /ModelRoutingEngine\.js[^\n]*?-\s*(\d+)\s*lines/i,
      path: path.join(repoRoot, 'src', 'services', 'ModelRoutingEngine.js'),
      label: 'ModelRoutingEngine.js'
    },
    {
      mdPattern: /universalPromptGenerator\.js[^\n]*?-\s*(\d+)\s*lines/i,
      path: path.join(repoRoot, 'src', 'utils', 'universalPromptGenerator.js'),
      label: 'universalPromptGenerator.js'
    },
    {
      mdPattern: /src\/server\.js[^\n]*?-\s*(\d+)\s*lines/i,
      path: path.join(repoRoot, 'backend', 'src', 'server.js'),
      label: 'backend/src/server.js'
    },
    {
      mdPattern: /config\/index\.js[^\n]*?-\s*(\d+)\s*lines/i,
      path: path.join(repoRoot, 'backend', 'src', 'config', 'index.js'),
      label: 'backend/src/config/index.js'
    },
    {
      mdPattern: /aiModels\.js[^\n]*?-\s*(\d+)\s*lines/i,
      path: path.join(repoRoot, 'src', 'data', 'aiModels.js'),
      label: 'src/data/aiModels.js'
    },
    {
      mdPattern: /roles\.js[^\n]*?-\s*(\d+)\s*lines/i,
      path: path.join(repoRoot, 'src', 'data', 'roles.js'),
      label: 'src/data/roles.js'
    }
  ]

  for (const spec of filesToCheck) {
    const match = md.match(spec.mdPattern)
    const actual = fileLines(spec.path)
    if (actual == null) {
      add(checks, false, `File not found: ${spec.label}`, { path: spec.path })
      continue
    }
    if (!match) {
      add(checks, false, `No documented line count in promptme.md for ${spec.label}`, { actual })
      continue
    }
    const documented = Number(match[1])
    const ok = documented === actual
    add(checks, ok, `Line count match for ${spec.label} (doc: ${documented}, actual: ${actual})`, { documented, actual })
  }

  // Supported Models (50+) check
  try {
    const aiModelsUrl = pathToFileURL(path.join(repoRoot, 'src', 'data', 'aiModels.js')).href
    const module = await import(aiModelsUrl)
    const AI_MODELS = module?.AI_MODELS || {}
    const modelCount = Object.keys(AI_MODELS).length
    const claimOk = /Supported Models \(50\+\)/.test(md)
    add(checks, modelCount >= 50 && claimOk, `Supported models count ≥ 50 (${modelCount}) and claim present`, { modelCount })
  } catch (e) {
    add(checks, false, `Failed to load AI_MODELS for count check: ${e.message}`)
  }

  // Summarize
  const failures = checks.filter(c => !c.ok)
  if (failures.length > 0) {
    console.log('Promptme.md up-to-date check: FAIL')
    failures.forEach((f, i) => {
      console.log(`- [${i + 1}] ${f.message}`)
      if (f.details) {
        console.log(`  details: ${JSON.stringify(f.details)}`)
      }
    })
    process.exit(1)
  } else {
    console.log('Promptme.md up-to-date check: PASS')
    process.exit(0)
  }
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(2)
})