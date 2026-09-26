# 项目维护

用户功能、安装和开发命令见 [README.md](README.md)。

## 实现与约束

- `src/reader.ts` 负责 Parquet 元信息、行范围读取和显示值转换；`src/extension.ts` 注册只读自定义编辑器及打开命令；`media/` 保存 Webview 脚本和样式；`test/` 保存 Node.js 测试。
- 保持磁盘只读访问；不添加数据上传、遥测或源文件写入。远程文件由 workspace 扩展主机读取；对非 `file` URI 给出明确错误。
- 单次读取限制为 1–1000 行。分页参数须在扩展端验证，不能只信任 Webview。文件总行数和起始行使用安全整数。
- 显示转换保留 bigint 精度；不要经由 Number 转换大整数。嵌套值和二进制的显示约定以 `formatValue` 为准。
- Webview 数据使用 `textContent` 渲染；保留 CSP、脚本 nonce 和受限资源目录。不要把文件内容拼入 HTML。
- 保留忙碌状态保护和面板销毁后的消息保护；注册的监听应在关闭时清理。
- 元信息在文档打开时缓存，刷新只重新读取当前页；修改刷新语义时同步检查 Reader 生命周期与文件替换行为。

## 验证与交付

运行 README 中的类型检查、构建和测试命令。读取器修改应覆盖相关编码、分页边界和显示精度；Webview 修改应补充真实 VS Code 中的交互验证。mock 测试不能代替宿主界面和远程环境检查。

临时样例和报告写入 `.file/`；不要提交 `dist/`、`node_modules/`、VSIX 或私有数据。打包后检查文件清单，确保包含运行时资源与许可证。行为变更更新 README 和 CHANGELOG；依赖变更核对 THIRD_PARTY_NOTICES.md。只有获得发布成功的结果后，才能将文档中的发布状态改为已发布。
