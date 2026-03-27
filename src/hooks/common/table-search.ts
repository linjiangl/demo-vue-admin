import { reactive } from 'vue';
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface';
import { searchAdmin, searchUser } from '@/service/api';

type SearchApiFunction<T> = (query: string) => Promise<{ data: T[] } | any>;
type FormatFunction<T> = (item: T) => { label: string; value: number | string };

type RemoteSearchOptions = {
  zeroOption?: boolean | { label?: string };
};

/**
 * 通用远程搜索 Hook
 * @param searchFn 搜索 API 函数
 * @param formatFn 格式化选项函数
 * @param errorPrefix 错误日志前缀
 * @param options
 */
export function useRemoteSearch<T>(
  searchFn: SearchApiFunction<T>,
  formatFn: FormatFunction<T>,
  errorPrefix: string,
  options?: RemoteSearchOptions
) {
  const zeroOptionLabel = typeof options?.zeroOption === 'object' ? options.zeroOption.label : undefined;

  const defaultOptions = options?.zeroOption
    ? [
      {
        label: zeroOptionLabel || '无上级',
        value: 0
      }
    ]
    : [];

  const searchState = reactive({
    loading: false,
    options: defaultOptions as SelectMixedOption[]
  });

  async function handleSearch(query: string) {
    if (!query) {
      searchState.options = defaultOptions;
      return;
    }

    searchState.loading = true;
    searchState.options = defaultOptions;

    try {
      const res = await searchFn(query);
      const data = res.data;

      if (data && data.length > 0) {
        const remoteOptions = data.map(formatFn).filter((option: ReturnType<FormatFunction<T>>) => option.value !== 0);
        searchState.options = [...defaultOptions, ...remoteOptions];
      }
    } catch (error) {
      console.error(`${errorPrefix} failed:`, error);
      searchState.options = defaultOptions;
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
export function useUserSearch(options?: RemoteSearchOptions) {
  return useRemoteSearch<Api.User.User>(
    searchUser,
    user => ({
      label: `${user.id} ${user.nickname}`,
      value: user.id
    }),
    'User search',
    options
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
