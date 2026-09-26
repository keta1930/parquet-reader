import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { gzipSync } from 'node:zlib';
import { Reader, formatValue } from '../dist/reader.mjs';

for (const codec of ['UNCOMPRESSED', 'SNAPPY', 'GZIP']) {
  test(`${codec}: metadata, paging across row groups, null and int64`, async () => {
    const file = parquetWriteBuffer({ codec, compressors: { GZIP: gzipSync }, rowGroupSize: 3, columnData: [
      { name: 'id', type: 'INT64', data: Array.from({ length: 7 }, (_, i) => 9007199254740993n + BigInt(i)) },
      { name: 'text', type: 'STRING', data: ['中文', null, '<script>alert(1)</script>', 'four', 'five', 'six', 'seven'] },
    ] });
    const reader = await Reader.open(file);
    assert.equal(reader.total, 7);
    assert.deepEqual(reader.columns, ['id', 'text']);
    const page = await reader.page(2, 3);
    assert.equal(page.rows.length, 3);
    assert.equal(page.rows[0][0], '9007199254740995');
    assert.equal(page.rows[0][1], '<script>alert(1)</script>');
    assert.equal((await reader.page(0, 3)).rows[1][1], 'null');
    assert.equal((await reader.page(6, 3)).rows.length, 1);
    assert.equal((await reader.page(100, 3)).start, 6);
    await assert.rejects(reader.page(-1, 3));
    await assert.rejects(reader.page(0, 1001));
  });
}
test('empty parquet retains column information', async () => {
  const reader = await Reader.open(parquetWriteBuffer({ columnData: [{ name: 'id', type: 'INT32', data: [] }] }));
  assert.deepEqual((await reader.page(0, 100)).rows, []);
  assert.deepEqual(reader.columns, ['id']);
});
test('invalid file is rejected', async () => {
  await assert.rejects(Reader.open(new ArrayBuffer(12)));
});
test('nested values, dates and bytes display without losing bigint precision', () => {
  assert.equal(formatValue({ value: 9007199254740993n }), '{"value":"9007199254740993"}');
  assert.equal(formatValue(new Date('2026-01-01Z')), '2026-01-01T00:00:00.000Z');
  assert.equal(formatValue(new Uint8Array([0, 255])), '0x00ff');
});
