# Changelog

## 0.1.3 — 2026-09-26

- Translate the README, maintenance guidance, version history and extension description into English.
- Keep reader behavior and interface labels unchanged.

## 0.1.2 — 2026-09-26

- Change the Marketplace display name to **Parquet Local Reader** to avoid an existing display-name conflict. The extension ID remains `keta1930.parquet-local-reader`.

## 0.1.1 — 2026-09-26

- Change the extension ID to `keta1930.parquet-local-reader` to avoid an existing Marketplace name conflict. Features and the GitHub repository URL remain unchanged.
- Users of older VSIX packages should uninstall `yyx-local.parquet-reader` or `keta1930.parquet-reader` before installing the new extension ID to avoid duplicate editor registrations.

## 0.1.0 — 2026-09-26

- Add the default read-only table view for `.parquet` / `.pq` files and the file-opening command (`localParquet.open`).
- Support 100 / 250 / 500 / 1000 rows per page, previous and next pages, row navigation and current-page refresh.
- Show schema metadata and full cell values while preserving large integer display precision.
- Add reader tests and mocked extension messaging tests with uncompressed, Snappy and Gzip samples.
- Add open-source information, maintenance constraints, author credits and the MIT license.
