# Developers Guide

This document is for maintainers and contributors of this monorepo.

## Workspace Structure

- `mermaid-diagram-pan-zoom/`: framework-agnostic SDK package
- `docusaurus-plugin-mermaid-pan-zoom/`: Docusaurus plugin package
- `examples/`: Docusaurus demo site for manual verification
- `scripts/prepare-publish.js`: version/publish preparation script

## Local Development

Install dependencies from workspace root:

```bash
pnpm install
```

Start example site:

```bash
pnpm --filter mermaid-pan-zoom-example dev
```

Build example site:

```bash
pnpm --filter mermaid-pan-zoom-example build
```

## Dependency and Security Checks

Check outdated dependencies:

```bash
pnpm -r outdated
```

Run production security audit:

```bash
pnpm audit --prod --audit-level=high
```

Notes:

- Workspace override pins `serialize-javascript` to `>=7.0.3` to mitigate `GHSA-5c6j-r48x-rmvq`.
- `react` and `react-dom` updates shown by `outdated` are currently only in `examples/` and should be validated with Docusaurus compatibility before major upgrades.

## Release Workflow

Version helpers:

```bash
pnpm version:patch
pnpm version:minor
pnpm version:major
pnpm version:restore
```

Publish dry-run per package:

```bash
cd mermaid-diagram-pan-zoom && pnpm pack:dry-run
cd docusaurus-plugin-mermaid-pan-zoom && pnpm pack:dry-run
```

Tag-based release (GitHub Actions):

1. Bump versions and commit changes.
2. Create tag (for example, `v1.3.1`).
3. Push branch and tag.

```bash
git add .
git commit -m "chore: release v1.3.1"
git tag v1.3.1
git push origin main --tags
```

Prerequisites:

- Add `NPM_TOKEN` as a repository secret in GitHub Actions.
- Ensure workflow paths match this repository layout.

## Packaging Notes

- `mermaid-diagram-pan-zoom` ships source directly (no transpile build step).
- `docusaurus-plugin-mermaid-pan-zoom` uses `lib/` source directly.
- Keep `license`, `repository`, and package versions aligned across publishable packages.

## License

MIT
