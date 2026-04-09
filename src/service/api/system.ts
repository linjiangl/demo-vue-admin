import { request } from '../request';

export function getUploadConfig(data?: Record<string, unknown>) {
  return request<Api.Common.UploadConfig>({
    url: '/upload/config',
    method: 'post',
    data
  });
}
