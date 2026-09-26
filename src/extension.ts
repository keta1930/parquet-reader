import * as vscode from 'vscode';
import { asyncBufferFromFile } from 'hyparquet';
import { randomBytes } from 'node:crypto';
import { Reader } from './reader';

const viewType = 'localParquet.reader';
interface Document extends vscode.CustomDocument { reader: Reader }

/** 注册 Parquet 的只读编辑器与打开命令。 */
export function activate(context: vscode.ExtensionContext) {
  const provider: vscode.CustomReadonlyEditorProvider<Document> = {
    async openCustomDocument(uri) {
      // Remote/WSL 的 workspace 扩展主机同样使用本地文件范围读取。
      if (uri.scheme !== 'file') throw new Error('请先将文件保存到本地或远程工作区磁盘，再打开 Parquet Reader。');
      const reader = await Reader.open(await asyncBufferFromFile(uri.fsPath));
      return { uri, reader, dispose() {} };
    },
    async resolveCustomEditor(document, panel) {
      const assets = vscode.Uri.joinPath(context.extensionUri, 'media');
      panel.webview.options = { enableScripts: true, localResourceRoots: [assets] };
      let busy = false;
      let disposed = false;
      const listener = panel.webview.onDidReceiveMessage(async (message: unknown) => {
        if (!message || typeof message !== 'object' || !('type' in message) || message.type !== 'page' || busy) return;
        busy = true;
        try {
          const request = message as { start?: unknown; size?: unknown };
          if (typeof request.start !== 'number' || typeof request.size !== 'number') throw new Error('无效的分页请求。');
          const page = await document.reader.page(request.start, request.size);
          if (!disposed) await panel.webview.postMessage({ type: 'page', ...page, schema: document.reader.schema });
        } catch (error) {
          if (!disposed) await panel.webview.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) });
        } finally { busy = false; }
      });
      panel.onDidDispose(() => { disposed = true; listener.dispose(); });
      const nonce = randomBytes(16).toString('hex');
      const script = panel.webview.asWebviewUri(vscode.Uri.joinPath(assets, 'viewer.js'));
      const css = panel.webview.asWebviewUri(vscode.Uri.joinPath(assets, 'viewer.css'));
      panel.webview.html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="stylesheet" href="${css}">
        <title>Parquet Reader</title></head><body>
        <header><strong>Parquet Reader</strong><span>本地只读预览</span></header>
        <nav aria-label="分页"><button id="prev">上一页</button><button id="next">下一页</button>
        <label>每页 <select id="size"><option>100</option><option>250</option><option>500</option><option>1000</option></select> 行</label>
        <form id="jump"><label>跳到第 <input id="row" type="number" min="1" value="1"> 行</label><button>跳转</button></form>
        <button id="refresh">刷新当前页</button></nav>
        <p id="status" role="status" aria-live="polite">正在读取…</p>
        <details><summary>字段结构</summary><pre id="schema"></pre></details>
        <main tabindex="0" aria-label="Parquet 数据表"><table><thead id="head"></thead><tbody id="body"></tbody></table></main>
        <p>点击单元格查看完整内容</p><pre id="value" tabindex="0"></pre>
        <script nonce="${nonce}" src="${script}"></script></body></html>`;
    },
  };
  context.subscriptions.push(vscode.window.registerCustomEditorProvider(viewType, provider));
  context.subscriptions.push(vscode.commands.registerCommand('localParquet.open', async (uri?: vscode.Uri) => {
    if (!uri) uri = (await vscode.window.showOpenDialog({ canSelectMany: false, filters: { Parquet: ['parquet', 'pq'] } }))?.[0];
    if (uri) await vscode.commands.executeCommand('vscode.openWith', uri, viewType);
  }));
}
