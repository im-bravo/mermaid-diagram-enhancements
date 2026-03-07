#!/usr/bin/env node
/**
 * Prepares packages for npm publish.
 * - Bumps versions (patch by default)
 * - Syncs plugin's mermaid-diagram-pan-zoom dependency to SDK version
 * - Validates with pack --dry-run
 * - Outputs git tag and push commands
 *
 * Usage: pnpm run prepare-publish [version|patch|minor|major]
 *   version: exact semver (e.g. 1.0.2)
 *   patch|minor|major: bump type (default: patch)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SDK_PATH = path.join(ROOT, 'mermaid-diagram-pan-zoom', 'package.json');
const PLUGIN_PATH = path.join(ROOT, 'docusaurus-plugin-mermaid-pan-zoom', 'package.json');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}

function semverBump(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function main() {
  const arg = process.argv[2] || 'patch';
  const sdkPkg = readJson(SDK_PATH);
  const pluginPkg = readJson(PLUGIN_PATH);

  let newVersion;
  if (['patch', 'minor', 'major'].includes(arg)) {
    newVersion = semverBump(sdkPkg.version, arg);
  } else if (/^\d+\.\d+\.\d+$/.test(arg)) {
    newVersion = arg;
  } else {
    console.error('Usage: pnpm run prepare-publish [version|patch|minor|major]');
    process.exit(1);
  }

  console.log(`Bumping to v${newVersion}...`);

  sdkPkg.version = newVersion;
  writeJson(SDK_PATH, sdkPkg);

  pluginPkg.version = newVersion;
  pluginPkg.dependencies['mermaid-diagram-pan-zoom'] = `^${newVersion}`;
  writeJson(PLUGIN_PATH, pluginPkg);

  console.log('  ✓ mermaid-diagram-pan-zoom');
  console.log('  ✓ docusaurus-plugin-mermaid-pan-zoom (dep synced)');

  const { execSync } = require('child_process');
  console.log('\nValidating...');
  execSync('npm run pack:dry-run', { cwd: path.join(ROOT, 'mermaid-diagram-pan-zoom'), stdio: 'inherit' });
  execSync('npm run pack:dry-run', { cwd: path.join(ROOT, 'docusaurus-plugin-mermaid-pan-zoom'), stdio: 'inherit' });

  console.log('\n✓ Ready to publish. Run:\n');
  console.log(`  git add .`);
  console.log(`  git commit -m "chore: release v${newVersion}"`);
  console.log(`  git tag v${newVersion}`);
  console.log(`  git push origin main --tags`);
  console.log('\n(GitHub Actions will publish to npm on tag push)');
}

main();
