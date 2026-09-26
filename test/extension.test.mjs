import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import path from 'node:path';
import { parquetWriteBuffer } from 'hyparquet-writer';

// 使用打包后的入口验证 VS Code 注册与 Webview 消息链路。
test('bundled extension opens a disk file and responds to webview paging', async () => {
  let provider;
  let handler;
  let disposed = false;
  let opened;
  const commands = new Map();
  const disposable = { dispose() {} };
  const vscode = {
    Uri: { joinPath: (base, ...parts) => `${base}/${parts.join('/')}` },
    window: { registerCustomEditorProvider: (type, value) => { provider = value; assert.equal(type, 'localParquet.reader'); return disposable; } },
    commands: {
      registerCommand: (name, callback) => { commands.set(name, callback); return disposable; },
      executeCommand: async (...args) => { opened = args; },
    },
  };
  const module = { exports: {} };
  const require = createRequire(import.meta.url);
  const execute = vm.runInThisContext(`(function(require,module,exports){${readFileSync('dist/extension.cjs', 'utf8')}\n})`);
  execute(name => name === 'vscode' ? vscode : require(name), module, module.exports);
  module.exports.activate({ subscriptions: [], extensionUri: 'extension' });
  const folder = '.file/tmp/20260926-parquet-test';
  mkdirSync(folder, { recursive: true });
  const filename = path.resolve(folder, 'sample.parquet');
  writeFileSync(filename, Buffer.from(parquetWriteBuffer({ columnData: [
    { name: '<img src=x>', type: 'STRING', data: ['中文', '<script>alert(1)</script>'] },
  ] })));
  const uri = { scheme: 'file', fsPath: filename };
  const document = await provider.openCustomDocument(uri);
  const messages = [];
  const panel = {
    onDidDispose: callback => { panel.dispose = callback; },
    webview: {
      cspSource: 'vscode-resource:',
      asWebviewUri: value => value,
      onDidReceiveMessage: callback => { handler = callback; return { dispose() { disposed = true; } }; },
      postMessage: async message => { messages.push(message); return true; },
    },
  };
  await provider.resolveCustomEditor(document, panel);
  assert.match(panel.webview.html, /default-src 'none'/);
  assert.ok(!panel.webview.html.includes('<img src=x>'));
  await handler({ type: 'page', start: 0, size: 100 });
  assert.equal(messages[0].total, 2);
  assert.equal(messages[0].rows[1][0], '<script>alert(1)</script>');
  await handler({ type: 'page', start: -1, size: 100 });
  assert.equal(messages[1].type, 'error');
  await commands.get('localParquet.open')(uri);
  assert.deepEqual(opened, ['vscode.openWith', uri, 'localParquet.reader']);
  await assert.rejects(provider.openCustomDocument({ scheme: 'https' }), /磁盘/);
  panel.dispose();
  assert.equal(disposed, true);
});
