import { request } from '../request';

export function getUploadConfig() {
  return request<any>({
    url: '/upload/config',
    method: 'get'
  });
}
