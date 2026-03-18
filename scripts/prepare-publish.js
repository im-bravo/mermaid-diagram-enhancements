#!/usr/bin/env node
/**
 * Prepare packages for publishing to npm.
 *
 * During local development all cross-package dependencies use "workspace:*" so
 * that pnpm resolves them from the local workspace without hitting the registry.
 *
 * Before publishing we must swap "workspace:*" → "^<version>" so that consumers
 * who install from npm get a real semver range.  After publishing (or on error)
 * we restore "workspace:*" so the repo stays in its dev-friendly state.
 *
 * Usage:
 *   node scripts/prepare-publish.js [patch|minor|major|<x.y.z>]
 *       Bump versions and replace workspace:* with real versions.
 *       Default bump type: patch
 *
 *   node scripts/prepare-publish.js --restore
 *       Restore workspace:* in all packages (undo a previous replace).
 *
 * In CI the workflow calls this script before `npm publish` and the restore is
 * not needed because the CI workspace is ephemeral.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SDK_PATH    = path.join(ROOT, 'mermaid-diagram-pan-zoom');
const PLUGIN_PATH = path.join(ROOT, 'docusaurus-plugin-mermaid-pan-zoom');

// All workspace package names that may appear as "workspace:*" dependencies
const WORKSPACE_PACKAGES = ['mermaid-diagram-pan-zoom'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
}

function writeJson(dir, obj) {
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(obj, null, 2) + '\n');
}

function semverBump(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

// ── Replace workspace:* → ^version ───────────────────────────────────────────

function replace(newVersion) {
  // 1. Bump SDK version
  const sdkPkg = readJson(SDK_PATH);
  sdkPkg.version = newVersion;
  writeJson(SDK_PATH, sdkPkg);
  console.log(`  ✓ mermaid-diagram-pan-zoom → ${newVersion}`);

  // 2. Bump plugin version and replace workspace:* with real version
  const pluginPkg = readJson(PLUGIN_PATH);
  pluginPkg.version = newVersion;

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (!pluginPkg[section]) continue;
    for (const name of WORKSPACE_PACKAGES) {
      if (pluginPkg[section][name] === 'workspace:*') {
        pluginPkg[section][name] = `^${newVersion}`;
        console.log(`  ✓ docusaurus-plugin: ${name}: workspace:* → ^${newVersion}`);
      }
    }
  }
  writeJson(PLUGIN_PATH, pluginPkg);
}

// ── Restore workspace:* ───────────────────────────────────────────────────────

function restore() {
  const pluginPkg = readJson(PLUGIN_PATH);
  let changed = false;

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (!pluginPkg[section]) continue;
    for (const name of WORKSPACE_PACKAGES) {
      const val = pluginPkg[section][name];
      if (val && val !== 'workspace:*' && !val.startsWith('file:')) {
        pluginPkg[section][name] = 'workspace:*';
        console.log(`  ✓ docusaurus-plugin: ${name}: ${val} → workspace:*`);
        changed = true;
      }
    }
  }

  if (changed) writeJson(PLUGIN_PATH, pluginPkg);
  else console.log('  (nothing to restore)');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--restore')) {
  console.log('Restoring workspace dependencies...\n');
  restore();
  console.log('\n✓ Restore complete.');
  process.exit(0);
}

// Determine new version
const bumpArg = args[0] || 'patch';
const sdkPkg  = readJson(SDK_PATH);

let newVersion;
if (['patch', 'minor', 'major'].includes(bumpArg)) {
  newVersion = semverBump(sdkPkg.version, bumpArg);
} else if (/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(bumpArg)) {
  newVersion = bumpArg;
} else {
  console.error(`Usage: node scripts/prepare-publish.js [patch|minor|major|<x.y.z>] [--restore]`);
  process.exit(1);
}

console.log(`Bumping to v${newVersion} and replacing workspace dependencies...\n`);
replace(newVersion);

// Validate with pack --dry-run
console.log('\nValidating packages...');
execSync('npm pack --dry-run', { cwd: SDK_PATH, stdio: 'inherit' });
execSync('npm pack --dry-run', { cwd: PLUGIN_PATH, stdio: 'inherit' });

console.log(`
✓ Ready to publish v${newVersion}.

Next steps:
  git add .
  git commit -m "chore: release v${newVersion}"
  git tag v${newVersion}
  git push origin main --tags

(GitHub Actions will publish to npm on tag push)

After publishing locally, restore workspace deps with:
  node scripts/prepare-publish.js --restore
`);
