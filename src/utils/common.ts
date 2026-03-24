import type { LocationQueryValue } from 'vue-router';
import { useRoute } from 'vue-router';
import { $t } from '@/locales';

/**
 * Filter out null and undefined values from object
 *
 * @example
 *   ```ts
 *   const obj = { a: 1, b: null, c: undefined, d: 'hello' };
 *   const filtered = filterNullish(obj);
 *   // { a: 1, d: 'hello' }
 *   ```
 *
 * @param obj
 */
export function filterNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null)) as Partial<T>;
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
 *
 * @param keys - specific keys to extract, if empty returns all
 */
export function getRouteQueryParams(...keys: string[]): Record<string, string> {
  const route = useRoute();
  const result: Record<string, string | null> = {};
  const entries = keys.length > 0 ? keys.map(k => [k, route.query[k]]) : Object.entries(route.query);

  for (const [key, value] of entries) {
    const v = value as LocationQueryValue | LocationQueryValue[];
    result[key as string] = Array.isArray(v) ? v[0] : v;
  }

  return filterNullish(result) as Record<string, string>;
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
 *
 * @param record
 */
export function transformRecordToOption<T extends Record<string | number, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => {
    // Check if the original key was a number
    const numValue = Number(value);
    const isNumberKey = Object.keys(record).some(key => key === value && !Number.isNaN(Number(key)));

    return {
      value: isNumberKey && !Number.isNaN(numValue) ? numValue : value,
      label
    };
  }) as CommonType.Option<keyof T, T[keyof T]>[];
}

/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options: CommonType.Option<string | number, App.I18n.I18nKey>[]) {
  return options.map(option => ({
    ...option,
    label: $t(option.label)
  }));
}

/**
 * Toggle html class
 *
 * @param className
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
 * @param bytes
 */
export function getFileSize(bytes: number): string {
  const fileSizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const base = 1024;
  if (bytes) {
    let i = 0;
    if (bytes >= base) {
      let a = bytes;
      while (a >= base) {
        a /= base;
        i += 1;
      }
    }
    return `${Number.parseFloat((bytes / base ** i).toFixed(2))} ${fileSizeUnits[i]}`;
  }
  return '0 KB';
}

export function openWebUrl(url: string) {
  window.open(url, '_blank', 'noopener=yes,noreferrer=yes');
}
