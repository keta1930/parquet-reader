# Project maintenance

See [README.md](README.md) for user features, installation and development commands.

## Implementation and constraints

- `src/reader.ts` handles Parquet metadata, row-range reads and display conversion; `src/extension.ts` registers the read-only custom editor and open command; `media/` contains Webview scripts and styles; `test/` contains Node.js tests.
- Keep disk access read-only. Do not add data uploads, telemetry or source-file writes. Remote files are read by the workspace extension host; return a clear error for non-`file` URIs.
- Limit each read to 1–1000 rows. Validate paging parameters in the extension; do not trust only the Webview. Use safe integers for total row counts and starting rows.
- Preserve bigint precision in display conversion; do not convert large integers through Number. Follow `formatValue` for nested-value and binary display conventions.
- Render Webview data with `textContent`. Preserve the CSP, script nonce and restricted resource directories. Do not interpolate file contents into HTML.
- Preserve busy-state guards and guards against messages after panel disposal. Clean up registered listeners when closing.
- Cache metadata when the document opens; refresh only rereads the current page. When changing refresh semantics, also check the Reader lifecycle and behavior when files are replaced.

## Validation and delivery

Run the type check, build and test commands in README. Reader changes should cover relevant encodings, paging boundaries and display precision. Webview changes also require interaction checks in real VS Code. Mock tests do not replace checks in the host UI and remote environments.

Write temporary samples and reports to `.file/`. Do not commit `dist/`, `node_modules/`, VSIX files or private data. After packaging, inspect the file list to ensure runtime resources and licenses are included. Update README and CHANGELOG for behavior changes; check THIRD_PARTY_NOTICES.md for dependency changes. Mark a version as published in the documentation only after receiving a successful publication result.
