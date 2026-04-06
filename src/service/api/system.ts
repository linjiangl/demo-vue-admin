import { request } from '../request';

export function getUploadConfig() {
  return request<Api.Common.UploadConfig>({
    url: '/upload/config',
    method: 'get'
  });
}
