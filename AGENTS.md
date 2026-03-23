# Agent Rules

These rules define language behavior for all AI agents and contributors in this repository.

## Default Language

- Primary language is English.
- Write all code comments in English.
- Write all project documentation in English.
- Write commit messages, PR descriptions, issue templates, and release notes in English.

## Applies To

- Root and package READMEs.
- Markdown docs under any folder.
- Inline comments and block comments in source code.
- Generated docs and usage examples.
- Changelog and release-related text.

## Exceptions

- Keep user-provided quoted text in the original language when needed.
- Keep product names, API names, command names, and code identifiers unchanged.
- If multilingual documentation is needed, English version must exist and be kept as the source of truth.

## Migration Rule

- Existing non-English comments or docs should be converted to English when those files are touched.

## Review Checklist

Before finishing a task, agents should verify:

1. New or updated documentation is in English.
2. New or updated code comments are in English.
3. No accidental language mixing remains, except allowed exceptions.
