import { transformRecordToOption } from '@/utils/common';

/** 管理员状态 */
export const adminStatusLabels: Record<number, string> = {
  0: '禁用',
  1: '启用'
};

export const adminStatusOptions = transformRecordToOption(adminStatusLabels);

/** 用户状态 */
export const userStatusLabels: Record<number, string> = {
  0: '已禁用',
  1: '已启用',
  30: '注销申请',
  31: '注销中',
  32: '已注销'
};

export const userStatusOptions = transformRecordToOption(userStatusLabels);

/** 轮播图状态 */
export const carouselStatusLabels: Record<number, string> = {
  0: '禁用',
  1: '启用'
};

export const carouselStatusOptions = transformRecordToOption(carouselStatusLabels);
