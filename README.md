# Parquet Local Reader

Browse Parquet files in a read-only VS Code table, with paging, row navigation, schema inspection and full cell values. Data is read from disk in the extension host; no network service is required.

## Usage

Requires VS Code 1.100 or later. After installing the extension, click a `.parquet` or `.pq` file to open the reader. You can also invoke the file-opening command (`localParquet.open`) from the Command Palette. If the file is already open in another editor, use **Reopen Editor With…** and select **Parquet Reader**. The extension's command title and reader controls currently use Chinese labels.

- Use the previous and next page controls to browse. Choose 100, 250, 500 or 1000 rows per page; the default is 100.
- Enter a row number starting at 1 and use the jump control. A number beyond the file's row count jumps to the last row.
- Expand the schema section to inspect Parquet schema metadata.
- Cells longer than 500 characters are truncated in the table. Click a cell, or focus it and press Enter, to view its full contents below the table.
- Refresh reloads the current row range. File metadata is cached when the file opens. If the source file is replaced or its schema or row count changes, close all reader tabs for that file and reopen it.

Top-level large integers appear as decimal text. Large integers in nested objects become strings, dates use ISO timestamps, and binary values appear as hexadecimal text prefixed with `0x`. This view is intended for reading and does not provide reversible data export.

## Files and limitations

The extension reads files from the disk accessible to the extension host. For WSL or SSH, install the extension in the corresponding remote environment and open files there. Virtual workspaces and direct access to HTTP or object storage URIs are not supported.

Data is requested by row range, but the amount decoded depends on the Parquet row group and column chunk layout. Paging does not guarantee fixed memory usage or read time; wide tables, very large cells and large row groups may still be slow. Files with row counts beyond JavaScript's safe integer range are rejected.

Full-file search, filtering, sorting, editing and export are not currently available. Files are never modified, and the extension makes no network requests and collects no telemetry. Format and compression decoding rely on `hyparquet` and `hyparquet-compressors`. Automated tests currently cover uncompressed, Snappy and Gzip samples; this does not establish support for every combination of Parquet encoding, logical type and compression.

## Installation and development

You can build a VSIX from source and select **Install from VSIX…** in the Extensions view's `…` menu. The extension ID is `keta1930.parquet-local-reader`; check its availability on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=keta1930.parquet-local-reader).

Development uses Node.js 22 and npm:

```sh
npm ci
npm run check
npm run build
npm test
npm run package
```

Install the resulting `parquet-local-reader-<version>.vsix` from the project root. `npm test` builds the project and runs Node.js tests for paging across row groups, empty and invalid files, large integer display, and extension registration and Webview messaging through a VS Code mock. It does not launch a real VS Code window.

After installation, use a file with known contents to check the default editor, paging, row navigation, schema inspection, full cell contents, refresh and error messages. Verify WSL and SSH behavior separately in those environments.

## Contributing and maintenance

Report problems through [Issues](https://github.com/keta1930/parquet-reader/issues) or submit a pull request. Include your VS Code version, environment, file size, writer tool and a minimal sample that can be shared publicly. Do not upload private data. See [AGENTS.md](https://github.com/keta1930/parquet-reader/blob/main/AGENTS.md) for maintenance constraints and [CHANGELOG.md](https://github.com/keta1930/parquet-reader/blob/main/CHANGELOG.md) for version history.

## Authors and license

Authors: **keta1930** and **codex-gpt-6-astra**.

This project uses the [MIT License](https://github.com/keta1930/parquet-reader/blob/main/LICENSE). Licenses for dependencies distributed with the extension are listed in [THIRD_PARTY_NOTICES.md](https://github.com/keta1930/parquet-reader/blob/main/THIRD_PARTY_NOTICES.md).
