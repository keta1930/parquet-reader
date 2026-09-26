const vscode = acquireVsCodeApi();
const el = id => document.getElementById(id);
let start = 0;
let total = 0;
let busy = false;

/** 更新分页控件状态，阻止重复读取。 */
function controls() {
  document.querySelectorAll('nav button, nav input, nav select').forEach(item => { item.disabled = busy; });
  el('prev').disabled = busy || start === 0;
  el('next').disabled = busy || start + Number(el('size').value) >= total;
}
/** 请求一页数据。 */
function request(offset) {
  if (busy) return;
  busy = true;
  controls();
  el('status').textContent = '正在读取…';
  vscode.postMessage({ type: 'page', start: offset, size: Number(el('size').value) });
}
window.addEventListener('message', ({ data }) => {
  busy = false;
  if (data.type === 'error') {
    el('status').textContent = `读取失败：${data.message}`;
    controls();
    return;
  }
  if (data.type !== 'page') return;
  start = data.start;
  total = data.total;
  vscode.setState({ start, size: Number(el('size').value) });
  el('status').textContent = total ? `第 ${start + 1}–${data.end} 行 / 共 ${total.toLocaleString()} 行 · ${data.columns.length} 列` : `空文件 · ${data.columns.length} 列`;
  el('schema').textContent = data.schema;
  el('head').replaceChildren();
  el('body').replaceChildren();
  el('value').textContent = '';
  const header = document.createElement('tr');
  for (const name of ['行号', ...data.columns]) {
    const cell = document.createElement('th');
    cell.textContent = name;
    header.append(cell);
  }
  el('head').append(header);
  for (const [index, row] of data.rows.entries()) {
    const tr = document.createElement('tr');
    for (const value of [String(start + index + 1), ...row]) {
      const td = document.createElement('td');
      td.textContent = value.length > 500 ? `${value.slice(0, 500)}…` : value;
      td.tabIndex = 0;
      td.addEventListener('click', () => { el('value').textContent = value; });
      td.addEventListener('keydown', event => { if (event.key === 'Enter') el('value').textContent = value; });
      tr.append(td);
    }
    el('body').append(tr);
  }
  controls();
});
el('prev').onclick = () => request(Math.max(0, start - Number(el('size').value)));
el('next').onclick = () => request(start + Number(el('size').value));
el('size').onchange = () => request(0);
el('refresh').onclick = () => request(start);
el('jump').onsubmit = event => {
  event.preventDefault();
  const row = Number(el('row').value);
  if (Number.isSafeInteger(row) && row >= 1) request(Math.min(row - 1, Math.max(0, total - 1)));
};
const state = vscode.getState();
if (state && [100, 250, 500, 1000].includes(state.size)) el('size').value = String(state.size);
request(state && Number.isSafeInteger(state.start) && state.start >= 0 ? state.start : 0);
