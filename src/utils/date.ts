import dayjs from 'dayjs';

/**
 * 日期字符串转时间戳（毫秒）
 * @param date 日期字符串，如 "1992-11-06" 或 "1992-11-06 12:00:00"
 * @returns 毫秒级时间戳
 */
export function dateToTimestamp(date: string): number {
  return dayjs(date).valueOf();
}

/**
 * 日期字符串转时间戳（秒）
 * @param date 日期字符串，如 "1992-11-06" 或 "1992-11-06 12:00:00"
 * @returns 毫秒级时间戳
 */
export function dateToUnix(date: string): number {
  return dayjs(date).unix();
}

/**
 * 时间戳或日期字符串转格式化日期字符串
 * @param timestamp 时间戳（毫秒）或日期字符串
 * @param format 格式，默认 "YYYY-MM-DD"
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: number | string, format = 'YYYY-MM-DD'): string {
  return formatDatetime(timestamp, format);
}

/**
 * 时间戳或日期字符串转格式化日期字符串
 * @param timestamp 时间戳（毫秒）或日期字符串
 * @param format 格式，默认 "YYYY-MM-DD HH:mm:ss"
 * @returns 格式化后的日期字符串
 */
export function formatDatetime(timestamp: number | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
  // 如果是字符串，直接格式化
  if (typeof timestamp === 'string') {
    return dayjs(timestamp).format(format);
  }
  // 直接按毫秒级时间戳处理
  return dayjs(timestamp).format(format);
}

/**
 * 获取 N 天前的日期时间
 * @param days 天数，默认 1
 * @param type 类型，"start" 返回当天开始时间，"end" 返回当天结束时间
 * @returns 日期时间字符串
 */
export function getDateSubtract(days: number = 1, type: 'start' | 'end' = 'start'): string {
  const date = dayjs().subtract(days, 'day');

  if (type === 'end') {
    return date.format('YYYY-MM-DD 23:59:59');
  }

  return date.format('YYYY-MM-DD 00:00:00');
}

/**
 * 获取 N 天前的时间戳（毫秒）
 * @param days 天数，默认 1
 * @param type 类型，"start" 返回当天开始时间，"end" 返回当天结束时间
 * @returns 毫秒级时间戳
 */
export function getDateSubtractTimestamp(days: number = 1, type: 'start' | 'end' = 'start'): number {
  const dateStr = getDateSubtract(days, type);
  return dateToTimestamp(dateStr);
}

export function toDatetimeRangeFieldProps() {
  return {
    valueFormat: 'yyyy-MM-dd HH:mm:ss',
    defaultTime: ['00:00:00', '23:59:59'],
    shortcuts: {
      今天: () => [getDateSubtractTimestamp(0), getDateSubtractTimestamp(0, 'end')],
      昨天: () => [getDateSubtractTimestamp(1), getDateSubtractTimestamp(1, 'end')],
      最近一周: () => [getDateSubtractTimestamp(7), getDateSubtractTimestamp(0, 'end')],
      最近一个月: () => [getDateSubtractTimestamp(30), getDateSubtractTimestamp(0, 'end')],
      最近三个月: () => [getDateSubtractTimestamp(90), getDateSubtractTimestamp(0, 'end')]
    }
  };
}
