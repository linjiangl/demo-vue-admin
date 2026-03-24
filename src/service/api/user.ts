import { request } from '../request';

export function fetchUserList(params?: Api.User.UserSearchParams) {
  return request<Api.User.UserList>({
    url: '/users',
    method: 'get',
    params
  });
}

export function fetchUserInfo(id: number) {
  return request<Api.User.User>({
    url: `/users/${id}`,
    method: 'get'
  });
}

export function createUser(data: any) {
  return request({
    url: '/users',
    method: 'post',
    data
  });
}

export function updateUser(id: number, data: any) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  });
}

export function searchUser(keyword: string) {
  return request<Api.User.User[]>({
    url: '/users/search',
    method: 'get',
    params: { keyword }
  });
}

