declare namespace Api {
  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type Admin = Common.CommonRecord<{
      username: string;
      avatar: string;
      real_name: string;
      mobile?: string;
      email?: string;
      password: string;
      status: number;
      last_login_at?: string;
    }>;

    type AdminSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Admin, 'username' | 'mobile' | 'real_name' | 'status'> & Common.CommonSearchParams
    >;

    type AdminList = Common.PaginatingQueryRecord<Admin>;

    type AdminRole = Common.CommonRecord<{
      name: string;
      identifier: string;
      permissions: string;
      is_super: number;
      is_system: number;
      status: number;
    }>;

    type AdminRoleSearchParams = CommonType.RecordNullable<
      Pick<AdminRole, 'name' | 'identifier' | 'is_super' | 'is_system' | 'status'> & Common.CommonSearchParams
    >;

    type AdminRoleList = Common.PaginatingQueryRecord<AdminRole>;

    type AdminMenu = Common.CommonRecord<{
      parent_id: number;
      type: string;
      name: string;
      icon: string;
      method: string;
      route_name: string;
      route_path: string;
      component: string;
      sorting: number;
      status: number;
    }>;

    type AdminMenuSearchParams = CommonType.RecordNullable<
      Pick<AdminMenu, 'parent_id' | 'type' | 'name' | 'status'> & Common.CommonSearchParams
    >;

    type AdminMenuList = Common.PaginatingQueryRecord<AdminMenu>;
  }
}
