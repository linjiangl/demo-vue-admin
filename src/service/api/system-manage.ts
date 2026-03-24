import { request } from '../request';

export function fetchAdminList(params?: Api.SystemManage.AdminSearchParams) {
  return request<Api.SystemManage.AdminList>({
    url: '/admins',
    method: 'get',
    params
  });
}

export function fetchAdminInfo(id: number) {
  return request<Api.SystemManage.Admin>({
    url: `/admins/${id}`,
    method: 'get'
  });
}

export function createAdmin(data: any) {
  return request({
    url: '/admins',
    method: 'post',
    data
  });
}

export function updateAdmin(id: number, data: any) {
  return request({
    url: `/admins/${id}`,
    method: 'put',
    data
  });
}

export function updateAdminPassword(id: number, data: object) {
  return request<Api.SystemManage.Admin>({
    url: `/admins/${id}/updatePassword`,
    method: 'put',
    data
  });
}

export function searchAdmin(keyword: string) {
  return request<Api.SystemManage.Admin[]>({
    url: '/admins/search',
    method: 'get',
    params: { keyword }
  });
}

export function fetchAdminRoleList(params?: any) {
  return request<Api.SystemManage.AdminRoleList>({
    url: '/admin/roles',
    method: 'get',
    params
  });
}

export function fetchAdminRoleInfo(id: number) {
  return request<Api.SystemManage.AdminRole>({
    url: `/admin/roles/${id}`,
    method: 'get'
  });
}

export function createAdminRole(data: any) {
  return request({
    url: '/admin/roles',
    method: 'post',
    data
  });
}

export function updateAdminRole(id: number, data: any) {
  return request({
    url: `/admin/roles/${id}`,
    method: 'put',
    data
  });
}

export function destroyAdminRole(id: number) {
  return request({
    url: `/admin/roles/${id}`,
    method: 'delete'
  });
}

export function saveRoleMenus(id: number, data: any) {
  return request({
    url: `/admin/roles/${id}/saveMenus`,
    method: 'post',
    data
  });
}

export function fetchAdminMenuList(params?: any) {
  return request<Api.SystemManage.AdminMenuList>({
    url: '/admin/menus',
    method: 'get',
    params
  });
}

export function fetchAdminMenuInfo(id: number) {
  return request<Api.SystemManage.AdminMenu>({
    url: `/admin/menus/${id}`,
    method: 'get'
  });
}

export function createAdminMenu(data: any) {
  return request({
    url: '/admin/menus',
    method: 'post',
    data
  });
}

export function updateAdminMenu(id: number, data: any) {
  return request({
    url: `/admin/menus/${id}`,
    method: 'put',
    data
  });
}

export function destroyAdminMenu(id: number) {
  return request({
    url: `/admin/menus/${id}`,
    method: 'delete'
  });
}
