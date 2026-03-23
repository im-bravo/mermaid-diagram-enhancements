# Release & Publish Workflow

## Version Bump Script

Located at `scripts/prepare-publish.js`. Run from workspace root via pnpm scripts.

```bash
pnpm run version:patch   # 1.0.0 → 1.0.1
pnpm run version:minor   # 1.0.0 → 1.1.0
pnpm run version:major   # 1.0.0 → 2.0.0
pnpm run version:restore # Restore workspace:* (undo a bump)
```

What the script does:
1. Reads current version from `mermaid-diagram-pan-zoom/package.json`
2. Bumps it (patch/minor/major or explicit x.y.z)
3. Writes new version to both `mermaid-diagram-pan-zoom/package.json` AND `docusaurus-plugin-mermaid-pan-zoom/package.json`
4. In the plugin's `package.json`, replaces `"mermaid-diagram-pan-zoom": "workspace:*"` → `"^<newVersion>"`

`--restore` does the reverse: sets `workspace:*` back in the plugin's dependencies.

## Why workspace:* Must Be Replaced

During local dev, pnpm uses `workspace:*` to resolve inter-package deps from the local filesystem. npm (the public registry) doesn't understand `workspace:*`, so publishing with it causes consumers' installs to fail. The script swaps it to a real semver range before publish.

## Manual Release (Local)

```bash
# 1. Bump versions
pnpm run version:patch

# 2. Commit & tag
git add .
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main --tags

# 3. (Optional) restore for local dev — CI doesn't need this
pnpm run version:restore
```

## Automated Release (GitHub Actions)

The workflow at `.github/workflows/publish-npm.yml` triggers on version tags (`v*`):
1. Runs `node scripts/prepare-publish.js` to replace `workspace:*`
2. Runs `npm publish` in both `mermaid-diagram-pan-zoom/` and `docusaurus-plugin-mermaid-pan-zoom/`
3. Uses the `NPM_TOKEN` repository secret for auth

**Required setup (one-time):**
- Create an npm Automation token at npmjs.com → Account → Access Tokens
- Add as GitHub repo secret: Settings → Secrets and variables → Actions → `NPM_TOKEN`

## Package Exports

Both packages publish the following files (controlled by `"files"` in package.json):

**mermaid-diagram-pan-zoom**:
- `src/` (index.js, enhance.js, defaultOptions.js)
- `styles/mermaid-enhancements.css`
- `README.md`

**docusaurus-plugin-mermaid-pan-zoom**:
- `lib/` (index.js, clientModules/mermaidEnhancements.js)
- `README.md`

## Current Versions

Both packages stay in sync (same version number). Check `mermaid-diagram-pan-zoom/package.json` for the canonical current version.

## Using in flat35-docs (Local Dev)

The flat35-docs site uses `file:` dependencies pointing to these packages:
```json
"dependencies": {
  "mermaid-diagram-pan-zoom": "file:../path/to/mermaid-diagram-pan-zoom",
  "docusaurus-plugin-mermaid-pan-zoom": "file:../path/to/docusaurus-plugin-mermaid-pan-zoom"
}
```
Changes to the SDK are immediately reflected without relinking (pnpm uses symlinks for workspace and file: deps).
