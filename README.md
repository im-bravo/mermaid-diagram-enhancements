# Packages

Publishable npm packages for Mermaid diagram pan/zoom functionality.

## Packages

| Package | Description |
|---------|-------------|
| [mermaid-diagram-pan-zoom](./mermaid-diagram-pan-zoom) | Framework-agnostic SDK: pan/zoom, fullscreen, copy, zoom controls for Mermaid diagrams |
| [docusaurus-plugin-mermaid-pan-zoom](./docusaurus-plugin-mermaid-pan-zoom) | Zero-config Docusaurus plugin that wires the SDK into Docusaurus |

## Relationship

```
mermaid-diagram-pan-zoom (SDK)
        ↑
        │ depends on
        │
docusaurus-plugin-mermaid-pan-zoom (Docusaurus integration)
```

- **mermaid-diagram-pan-zoom** — Use directly in any project (VitePress, custom sites, etc.)
- **docusaurus-plugin-mermaid-pan-zoom** — Use in Docusaurus; it depends on the SDK and configures it automatically

## Local development

From this directory or the workspace root:

```bash
pnpm install
```

## Publishing to npm

Publishing is automated via GitHub Actions. Push a version tag to trigger:

```bash
# 1. Bump version in both package.json files, then:
git add .
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

**Setup required:**
1. Create an [npm access token](https://www.npmjs.com/settings/~/tokens) (Automation type).
2. Add it as a GitHub secret: **Settings → Secrets and variables → Actions → New repository secret** → Name: `NPM_TOKEN`, Value: your token.

**Note:** If your repo has packages at the root (not in `packages/`), update the `working-directory` paths in `.github/workflows/publish-npm.yml`.

To use in flat35-docs, the packages are linked via `file:` dependencies.

## Publishing to npm

Publishing is automated via GitHub Actions when you push a version tag.

### Setup (one-time)

1. **Create an npm access token** at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) (Automation type).
2. **Add the token as a GitHub secret**: Repo → Settings → Secrets and variables → Actions → New repository secret → Name: `NPM_TOKEN`, Value: your token.

### Release flow

1. Bump version in both `package.json` files (e.g. `1.0.0` → `1.0.1`).
2. Commit and push.
3. Create and push a tag: `git tag v1.0.1 && git push origin v1.0.1`
4. The workflow publishes both packages to npm.

**Note:** If your repo has packages at the root (no `packages/` folder), update the `working-directory` paths in `.github/workflows/publish-npm.yml`.

## Publishing to npm

Publishing is automated via GitHub Actions. When you push a version tag (e.g. `v1.0.1`), both packages are published to npm.

### Setup

1. **Create an npm token** at [npmjs.com](https://www.npmjs.com/) → Account → Access Tokens → Generate New Token (Automation type).

2. **Add the token as a GitHub secret** in your repo: Settings → Secrets and variables → Actions → New repository secret. Name it `NPM_TOKEN`.

### Release flow

1. Bump version in both `package.json` files.
2. Commit and push.
3. Create and push a tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. The workflow (`.github/workflows/publish-npm.yml`) runs and publishes both packages.

**Note:** If your repo has packages at the root (no `packages/` folder), update the `working-directory` paths in the workflow.

To use in flat35-docs, the packages are linked via `file:` dependencies.

## Publishing to npm

Auto-publish runs when you push a version tag (e.g. `v1.0.0`).

### Setup (one-time)

1. Create an [npm access token](https://www.npmjs.com/settings/~/tokens) (Automation type).
2. Add it as a GitHub secret: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `NPM_TOKEN`
   - Value: your npm token

### Release flow

1. Bump version in both `package.json` files.
2. Commit and push.
3. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. The workflow publishes both packages to npm.

**Note:** If your repo has packages at the root (no `packages/` folder), update the `working-directory` paths in [.github/workflows/publish-npm.yml](../.github/workflows/publish-npm.yml).
## Publishing to npm

Publishing is automated via GitHub Actions. Push a version tag to trigger:

```bash
# 1. Bump version in both package.json files (e.g. 1.0.0 → 1.0.1)
# 2. Commit the changes
git add packages/*/package.json && git commit -m "chore: bump to 1.0.1"

# 3. Create and push tag (use same version as package.json)
git tag v1.0.1
git push origin main --tags
```

### Setup required

1. **npm token**: Create an [npm access token](https://www.npmjs.com/settings/~/tokens) (Automation type).
2. **GitHub secret**: In your repo → Settings → Secrets and variables → Actions, add `NPM_TOKEN` with the token value.
3. **Workflow location**: The workflow is at `.github/workflows/publish-npm.yml`. If your repo has packages at root (no `packages/` folder), update the `working-directory` paths in the workflow.

To use in flat35-docs, the packages are linked via `file:` dependencies.

## Publishing to npm

Publishing is automated via GitHub Actions when you push a version tag.

### Setup (one-time)

1. **Create an npm access token** at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) (Automation type for CI).

2. **Add the token as a GitHub secret**: Repo → Settings → Secrets and variables → Actions → New repository secret:
   - Name: `NPM_TOKEN`
   - Value: your npm token

### Release flow

1. Bump version in both `package.json` files (e.g. `1.0.0` → `1.0.1`).
2. Commit and push.
3. Create and push a tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. The workflow publishes both packages to npm in order (SDK first, then plugin).

**Note:** If your repo has packages at the root (no `packages/` folder), update the `working-directory` paths in [.github/workflows/publish-npm.yml](../.github/workflows/publish-npm.yml).

## Publishing to npm

Publishing is automated via GitHub Actions when you push a version tag.

### Setup (one-time)

1. **Create an npm access token** at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens) (Automation type for CI).

2. **Add the token as a GitHub secret** in your repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `NPM_TOKEN`
   - Value: your npm token

### Release flow

1. Bump version in both `package.json` files (e.g. `1.0.0` → `1.0.1`).
2. Commit and push.
3. Create and push a tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. The workflow (`.github/workflows/publish-npm.yml`) runs and publishes both packages to npm.

**Note:** If your repo has packages at the root (no `packages/` folder), update the `working-directory` paths in the workflow.

## Publishing to npm

Publishing is automated via GitHub Actions when you push a version tag.

### Setup (one-time)

1. Create an [npm access token](https://www.npmjs.com/settings/~/tokens) (Automation type).
2. Add it as a GitHub secret: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `NPM_TOKEN`
   - Value: your npm token

### Release flow

1. Bump version in both `package.json` files (e.g. `1.0.0` → `1.0.1`).
2. Commit and push.
3. Create and push a tag:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. The workflow (`.github/workflows/publish-npm.yml`) runs and publishes both packages to npm.

**Note:** If your repo has packages at the root (no `packages/` folder), update the `working-directory` paths in the workflow.
