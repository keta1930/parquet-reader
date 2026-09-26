# Parquet Local Reader

在 VS Code 中以只读表格查看本地 Parquet 文件，支持分页、行号跳转和字段结构预览。

Browse Parquet files in a read-only VS Code table, with paging, row navigation, schema inspection and full cell values. Data is read from disk in the extension host; no network service is required.

## 使用

需要 VS Code 1.100 或更新版本。安装扩展后，点击 `.parquet` 或 `.pq` 文件即可打开阅读视图；也可以从命令面板执行 **Parquet: 打开文件**。如果文件已使用其他编辑器打开，可使用 **重新打开编辑器的方式…** 选择 **Parquet Reader**。

- 用 **上一页 / 下一页** 浏览，每页可选 100、250、500 或 1000 行，默认 100 行。
- 输入从 1 开始的行号后点击 **跳转**；超出文件范围会跳到最后一行。
- 展开 **字段结构** 查看 Parquet schema 元信息。
- 表格中超过 500 个字符的单元格会截断显示；点击单元格或将焦点移入后按 Enter，可在下方查看完整内容。
- **刷新当前页** 会重新读取当前行范围。文件元信息在打开时缓存；源文件被替换或结构、行数发生变化后，请关闭该文件的所有阅读标签，再重新打开。

顶层大整数以十进制文本显示；嵌套对象中的大整数转为字符串，日期显示为 ISO 时间，二进制值显示为 `0x` 开头的十六进制文本。此视图用于阅读，不提供可逆的数据导出。

## 文件与限制

读取扩展主机所在磁盘上的文件。WSL / SSH 场景需在对应远程环境安装扩展，并打开该环境中的文件；不支持虚拟工作区或直接读取 HTTP / 对象存储 URI。

按行范围请求数据，实际解码量取决于 Parquet 的行组与列块布局。分页不保证固定内存占用或固定读取时间，宽表、巨大单元格和大行组仍可能较慢。行数超过 JavaScript 安全整数范围的文件会被拒绝。

当前不提供全文件搜索、筛选、排序、编辑或导出。文件不会被修改；扩展没有网络请求或遥测。格式及压缩解码依赖 `hyparquet` 和 `hyparquet-compressors`，当前自动化测试覆盖未压缩、Snappy、Gzip，不能视为验证了所有 Parquet 编码、逻辑类型和压缩组合。

## 安装与开发

可以从源码生成 VSIX，再在扩展面板的 `…` 菜单选择 **从 VSIX 安装…**。扩展标识为 `keta1930.parquet-local-reader`，可在 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=keta1930.parquet-local-reader) 查看其可用状态。

开发使用 Node.js 22 和 npm：

```sh
npm ci
npm run check
npm run build
npm test
npm run package
```

打包后选择项目根目录生成的 `parquet-local-reader-<version>.vsix` 安装。`npm test` 会先构建，然后运行 Node.js 测试，覆盖跨行组分页、空文件、无效文件、大整数显示以及使用 VS Code mock 的扩展注册和 Webview 消息链路；它不启动真实 VS Code 窗口。

安装后可用一个已知内容的文件检查：默认打开方式、分页和行号跳转、字段结构、完整单元格内容、刷新和错误提示。WSL / SSH 行为需要在对应环境单独验证。

## 贡献与维护

欢迎通过 [Issues](https://github.com/keta1930/parquet-reader/issues) 报告问题或提交 Pull Request。请附上 VS Code 版本、运行环境、文件大小、写入工具与可公开的最小示例，不要上传私有数据。维护约束见 [AGENTS.md](https://github.com/keta1930/parquet-reader/blob/main/AGENTS.md)，版本变化见 [CHANGELOG.md](https://github.com/keta1930/parquet-reader/blob/main/CHANGELOG.md)。

## 作者与许可

作者：**keta1930** 和 **codex-gpt-6-astra**。

本项目使用 [MIT License](https://github.com/keta1930/parquet-reader/blob/main/LICENSE)。随扩展分发的依赖许可见 [THIRD_PARTY_NOTICES.md](https://github.com/keta1930/parquet-reader/blob/main/THIRD_PARTY_NOTICES.md)。
