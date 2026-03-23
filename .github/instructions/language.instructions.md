---
applyTo: "**/*.{md,mdx,js,jsx,ts,tsx,mjs,cjs,css,scss,json,yml,yaml}"
description: "Use when: writing or updating docs, code comments, config comments, release notes, or developer explanations. Enforce English as the primary language for repository content."
---

# Language Instruction

Use English as the primary language in this repository.

## Required

- Write all Markdown and MDX documentation in English.
- Write all code comments in English.
- Write release notes, changelog entries, commit messages, and PR descriptions in English.
- Keep generated usage examples and technical explanations in English.

## Allowed Exceptions

- Keep direct user quotes in their original language when needed.
- Do not translate code identifiers, API names, command names, paths, or product names.
- If bilingual content is required, provide a complete English version and keep English as the source of truth.

## Migration Rule

- When touching files that contain non-English comments or docs, convert the touched parts to English.

## Self-Check

Before finishing edits:

1. Confirm newly added or updated comments are in English.
2. Confirm newly added or updated documentation is in English.
3. Confirm no accidental language mixing remains, except allowed exceptions.
