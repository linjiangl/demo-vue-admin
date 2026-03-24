declare namespace Api {
  /**
   * namespace User
   *
   * 用户模块
   */
  namespace User {
    type User = Common.CommonRecord<{
      uuid: string;
      username: string;
      nickname: string;
      mobile: string | null;
      email: string | null;
      avatar: string;
      avatar_url: string;
      gender: number;
      password: string;
      status: number;
      is_system: number;
      from: string;
      last_login_at: string | null;
      last_active_at: string | null;
      property?: UserProperty;
      deleted_at: string | null;
    }>;

    type UserSearchParams = CommonType.RecordNullable<
      Pick<User, 'uuid' | 'username' | 'nickname' | 'mobile' | 'email' | 'status'> & Common.CommonSearchParams
    >;

    type UserList = Common.PaginatingQueryRecord<User>;

    type UserProperty = {
      user_id: number;
      verified_mobile_at: string | null;
      verified_email_at: string | null;
      updated_avatar_at: string | null;
      updated_username_at: string | null;
      created_at: string;
      updated_at: string;
    };
  }
}
