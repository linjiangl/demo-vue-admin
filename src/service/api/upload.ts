import { request } from '../request';

export function getUploadConfig() {
  return request<Api.Upload.UploadConfig>({
    url: '/upload/config',
    method: 'get'
  });
}
