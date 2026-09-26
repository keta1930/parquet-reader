import { parquetMetadataAsync, parquetReadObjects, parquetSchema } from 'hyparquet';
import type { AsyncBuffer, FileMetaData } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';

/** 将 Parquet 值转换为可显示的文本，保留大整数精度。 */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array) return `0x${Buffer.from(value).toString('hex')}`;
  if (typeof value === 'object') {
    return JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item);
  }
  return String(value);
}

/** 缓存文件元信息并读取指定行范围。 */
export class Reader {
  readonly total: number;
  readonly columns: string[];
  readonly schema: string;

  /** 从已解析的元信息构建只读数据源。 */
  private constructor(private file: AsyncBuffer, private metadata: FileMetaData) {
    this.total = Number(metadata.num_rows);
    if (!Number.isSafeInteger(this.total)) throw new Error('文件行数超出安全读取范围。');
    this.columns = parquetSchema(metadata).children.map(child => child.element.name);
    this.schema = JSON.stringify(metadata.schema.slice(1), null, 2);
  }

  /** 读取文件页脚并验证 Parquet 格式。 */
  static async open(file: AsyncBuffer): Promise<Reader> {
    return new Reader(file, await parquetMetadataAsync(file));
  }

  /** 返回一页数据，限制单次请求规模。 */
  async page(start: number, size: number) {
    if (!Number.isSafeInteger(start) || start < 0 || !Number.isInteger(size) || size < 1 || size > 1000) {
      throw new Error('无效的分页参数。');
    }
    start = Math.min(start, Math.max(0, this.total - 1));
    const end = Math.min(start + size, this.total);
    const data = this.total === 0 ? [] : await parquetReadObjects({
      file: this.file, metadata: this.metadata, compressors, rowStart: start, rowEnd: end,
    });
    return {
      start, end, total: this.total, columns: this.columns,
      rows: data.map(row => this.columns.map(column => formatValue(row[column]))),
    };
  }
}
