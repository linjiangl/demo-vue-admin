import type { LocationQueryValue } from 'vue-router';
import { useRoute } from 'vue-router';
import { $t } from '@/locales';

type Nullish = null | undefined;

type RouteQueryParser<T> = (value: string) => T;

/**
 * Filter out null and undefined values from object
 *
 * @example
 *   ```ts
 *   const obj = { a: 1, b: null, c: undefined, d: 'hello' };
 *   const filtered = filterNullish(obj);
 *   // { a: 1, d: 'hello' }
 *   ```
 */
export function filterNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => !isNullish(value))) as Partial<T>;
}

/**
 * Get query params from current route as string values (filtered nullish)
 *
 * @example
 *   ```ts
 *   // URL: /admin?id=123&name=test&status=1
 *   getRouteQueryParams(); // { id: '123', name: 'test', status: '1' }
 *   getRouteQueryParams('id'); // { id: '123' }
 *   getRouteQueryParams('id', 'name'); // { id: '123', name: 'test' }
 *   ```
 */
export function getRouteQueryParams<Key extends string>(...keys: Key[]): Partial<Record<Key, string>> {
  const route = useRoute();
  const result: Partial<Record<Key, string | null>> = {};
  const entries =
    keys.length > 0 ? keys.map(key => [key, route.query[key]] as const) : (Object.entries(route.query) as [Key, unknown][]);

  for (const [key, value] of entries) {
    result[key] = getSingleRouteQueryValue(value);
  }

  return filterNullish(result) as Partial<Record<Key, string>>;
}

/**
 * 获取单个路由查询参数，可按需转换为目标类型。
 * @param key 查询参数名
 * @param parser 可选的解析函数，不传时返回原始字符串
 * @returns 解析后的值，不存在时返回 null
 */
export function getRouteQueryParam<T = string>(key: string, parser?: RouteQueryParser<T>): T | null {
  const route = useRoute();
  const value = getSingleRouteQueryValue(route.query[key]);

  if (isNullish(value)) {
    return null;
  }

  if (parser) {
    return parser(value);
  }

  return value as T;
}

/**
 * Transform record to option
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```
 *
 * @example
 *   ```ts
 *   const record = {
 *     0: 'label0',
 *     1: 'label1'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 0, label: 'label0' },
 *   //   { value: 1, label: 'label1' }
 *   // ]
 *   ```
 */
export function transformRecordToOption<T extends Record<string | number, string>>(record: T) {
  const entries = Object.entries(record);
  const shouldConvertToNumber = entries.length > 0 && entries.every(([value]) => isNumericKey(value));

  return entries.map(([value, label]) => ({
    value: shouldConvertToNumber ? Number(value) : value,
    label
  })) as CommonType.Option<keyof T, T[keyof T]>[];
}

/**
 * Translate options
 */
export function translateOptions(options: CommonType.Option<string | number, App.I18n.I18nKey>[]) {
  return options.map(option => ({
    ...option,
    label: $t(option.label)
  }));
}

/**
 * Toggle html class
 */
export function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

/**
 * 获取文件大小
 */
export function getFileSize(bytes: number): string {
  const fileSizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const base = 1024;

  if (bytes) {
    let index = 0;
    let value = bytes;

    while (value >= base) {
      value /= base;
      index += 1;
    }

    return `${Number.parseFloat((bytes / base ** index).toFixed(2))} ${fileSizeUnits[index]}`;
  }

  return '0 KB';
}

export function openWebUrl(url: string) {
  window.open(url, '_blank', 'noopener=yes,noreferrer=yes');
}

function isNullish(value: unknown): value is Nullish {
  return value == null;
}

function getSingleRouteQueryValue(queryValue: unknown): string | null {
  const value = queryValue as LocationQueryValue | LocationQueryValue[];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function parseNumberParam(value: string): number | null {
  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

function isNumericKey(value: string) {
  return value.trim() !== '' && Number.isFinite(Number(value));
}
