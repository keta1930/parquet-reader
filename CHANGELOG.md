# Changelog

## 0.1.1 — 2026-09-26

- 扩展标识调整为 `keta1930.parquet-local-reader`，避免 Marketplace 已有名称冲突；功能和 GitHub 仓库地址保持不变。
- 使用旧 VSIX 的用户请卸载 `yyx-local.parquet-reader` 或 `keta1930.parquet-reader`，再安装新标识，避免重复编辑器注册。

## 0.1.0 — 2026-09-26

- 新增 `.parquet` / `.pq` 默认只读表格视图和 **Parquet: 打开文件** 命令。
- 支持每页 100 / 250 / 500 / 1000 行、上一页 / 下一页、行号跳转和当前页刷新。
- 展示字段结构与完整单元格内容，保留大整数显示精度。
- 提供读取器测试和扩展消息链路 mock 测试，覆盖未压缩、Snappy 与 Gzip 样例。
- 补充开源说明、维护约束、作者署名及 MIT 许可。
