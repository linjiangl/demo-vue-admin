import { reactive } from 'vue';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import { searchAdmin, searchUser } from '@/service/api';

type SearchApiFunction<T> = (query: string) => Promise<{ data: T[] } | any>;
type FormatFunction<T> = (item: T) => { label: string; value: number | string };

/**
 * 通用远程搜索 Hook
 * @param searchFn 搜索 API 函数
 * @param formatFn 格式化选项函数
 * @param errorPrefix 错误日志前缀
 */
export function useRemoteSearch<T>(searchFn: SearchApiFunction<T>, formatFn: FormatFunction<T>, errorPrefix: string) {
  const searchState = reactive({
    loading: false,
    options: [] as SelectMixedOption[]
  });

  async function handleSearch(query: string) {
    if (!query) {
      searchState.options = [];
      return;
    }

    searchState.loading = true;
    searchState.options = [];

    try {
      const res = await searchFn(query);
      const data = res.data;

      if (data && data.length > 0) {
        searchState.options = data.map(formatFn);
      }
    } catch (error) {
      console.error(`${errorPrefix} failed:`, error);
      searchState.options = [];
    } finally {
      searchState.loading = false;
    }
  }

  return {
    searchState,
    handleSearch
  };
}

/**
 * 用户搜索配置
 */
export function useUserSearch() {
  return useRemoteSearch<Api.User.User>(
    searchUser,
    user => ({
      label: `${user.id} ${user.nickname}`,
      value: user.id
    }),
    'User search'
  );
}

/**
 * 管理员搜索配置
 */
export function useAdminSearch() {
  return useRemoteSearch<Api.SystemManage.Admin>(
    searchAdmin,
    user => ({
      label: `${user.id} ${user.username}`,
      value: user.id
    }),
    'User search'
  );
}
