import type { ComputedRef, Ref } from 'vue';
import { computed, ref, shallowRef, toValue } from 'vue';
import { useRoute } from 'vue-router';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import type { ProDataTableColumns, ProSearchFormColumn } from 'pro-naive-ui';
import { createProModalForm, createProSearchForm, useNDataTable } from 'pro-naive-ui';
import type { FlatResponseData } from '@sa/axios';
import type { TableColumnCheck } from '@sa/hooks';
import { useLoading } from '@sa/hooks';
import { jsonClone } from '@sa/utils';
import { filterNullish } from '@/utils/common';
import { getDateSubtract } from '@/utils/date';
import { $t } from '@/locales';

/** 日期参数选项类型 */
type DateParamOptions<T extends Record<string, any> = Record<string, any>> = {
  /** URL parameter name, default 'date' */
  paramName?: string;
  /** Target form field name, default 'created_at' */
  targetField?: keyof T | string;
  /** Auto trigger search, default true */
  autoSearch?: boolean;
};

type UseProPaginatedTableOptions<ApiData, SearchParams extends Record<string, any>> = {
  /** API function, receives pagination and search values */
  api: (
    params: { current: number; size: number } & SearchParams
  ) => Promise<FlatResponseData<any, Api.Common.PaginatingQueryRecord<ApiData>>>;
  /** Table columns definition */
  columns: () => ProDataTableColumns<ApiData>;
  /** Search form columns definition */
  searchColumns?: () => ProSearchFormColumn<SearchParams>[];
  /** Initial search form values */
  initialSearchValues?: SearchParams;
  /** Extra params not in form, always sent with API requests */
  extraParams?: Partial<SearchParams>;
  /** Default current page (default: 1) */
  defaultCurrent?: number;
  /** Default page size (default: 10) */
  defaultPageSize?: number;
  /** Default collapsed state for search form (default: true) */
  defaultCollapsed?: boolean;
  /** Default sort order */
  defaultSortBy?: string;
  defaultOrder?: 'asc' | 'desc';
  /** Search form span multiplier: number or ComputedRef (default: auto computed based on screen width) */
  searchSpanMultiplier?: number | ComputedRef<number> | 'auto';
  /** Auto handle URL date parameter (e.g., ?date=today) */
  dateParamOptions?: false | DateParamOptions<SearchParams>;
};

/**
 * Hook for pro-naive-ui paginated table
 *
 * Wraps useNDataTable with common patterns
 */
export function useProPaginatedTable<ApiData, SearchParams extends Record<string, any> = Record<string, never>>(
  options: UseProPaginatedTableOptions<ApiData, SearchParams>
) {
  const {
    api,
    columns,
    searchColumns,
    initialSearchValues,
    extraParams,
    defaultCurrent = 1,
    defaultPageSize = 10,
    defaultCollapsed = true,
    defaultSortBy,
    defaultOrder,
    searchSpanMultiplier = 'auto',
    dateParamOptions
  } = options;

  const route = useRoute();

  // 自动计算 span 倍数（基于屏幕宽度）
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const autoSpanMultiplier = computed(() => {
    if (breakpoints.smaller('lg').value) return 1; // < 1024px
    return 2; // >= 1024px
  });

  // 确定最终使用的 span 倍数
  const finalSpanMultiplier = computed(() => {
    if (searchSpanMultiplier === 'auto') {
      return autoSpanMultiplier.value;
    }
    return toValue(searchSpanMultiplier);
  });

  // Create search form
  const searchForm = createProSearchForm<SearchParams>({
    defaultCollapsed,
    initialValues: initialSearchValues ?? ({} as SearchParams)
  });

  // 自动将 extraParams 填充到搜索表单中
  if (extraParams && Object.keys(extraParams).length > 0) {
    Object.assign(searchForm.values.value, extraParams);
  }

  // 处理 URL date 参数（如 ?date=today 或 ?date=yesterday）
  if (dateParamOptions !== false) {
    handleDateParam(searchForm, route.query, dateParamOptions ?? undefined);
  }

  // Sort state: format "field-order", e.g., "id-descend", "created_at-ascend"
  const sorting = ref<string | undefined>(
    defaultSortBy && defaultOrder ? `${defaultSortBy}-${defaultOrder === 'asc' ? 'ascend' : 'descend'}` : undefined
  );

  // Fetch function for useNDataTable
  async function fetchList(
    params: { current: number; pageSize: number },
    values: SearchParams
  ): Promise<{ total: number; list: ApiData[] }> {
    // Call API with pagination + sort + extra params (filtered) + search values
    const response = await api({
      current: params.current,
      size: params.pageSize,
      sorting: sorting.value,
      ...filterNullish(extraParams ?? {}),
      ...values
    } as { current: number; size: number } & SearchParams);

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      return { total: 0, list: [] };
    }

    return {
      total: response.data.total,
      list: response.data.records
    };
  }

  // Use pro-naive-ui's useNDataTable
  const { table, search } = useNDataTable(
    ({ current, pageSize }, values) => fetchList({ current, pageSize }, values as SearchParams),
    {
      form: searchForm,
      defaultCurrent,
      defaultPageSize
    }
  );

  // Extract table properties
  const { tableProps, onChange } = table;
  const { proSearchFormProps } = search;

  // Data and loading are accessed from tableProps
  const data = computed(() => tableProps.value.data as ApiData[]);
  const loading = computed(() => tableProps.value.loading);

  // Column checks for TableHeaderOperation
  const columnChecks = ref<TableColumnCheck[]>(getColumnChecks(columns()));

  // Filtered columns based on checks
  const tableColumns = computed(() => {
    const cols = columns();
    return getFilteredColumns(cols, columnChecks.value);
  });

  // Reload column checks (e.g., when locale changes)
  function reloadColumns() {
    columnChecks.value = getColumnChecks(columns());
  }

  // Computed search columns with span multiplier
  const formColumns = computed(() => {
    const cols = searchColumns?.() ?? [];
    const multiplier = finalSpanMultiplier.value;
    if (multiplier === 1) {
      return cols;
    }
    return cols.map(col => ({
      ...col,
      span: typeof col.span === 'number' ? col.span * multiplier : col.span
    }));
  });

  // Get data by page
  async function getDataByPage(page: number = 1) {
    await onChange({ page });
  }

  // Refresh data
  async function getData() {
    await onChange();
  }

  // Update search values and trigger query
  function updateSearchValues(values: Partial<SearchParams>, triggerSearch = true) {
    Object.assign(searchForm.values.value, values);
    if (triggerSearch) {
      searchForm.submit();
    }
  }

  // Handle NaiveUI table sorter change
  function onSortChange(sorter: { columnKey: string; order: 'ascend' | 'desc' | null }) {
    sorting.value = sorter.order ? `${sorter.columnKey}-${sorter.order}` : undefined;
  }

  return {
    // Table related
    columns: tableColumns,
    columnChecks,
    data,
    loading,
    tableProps,
    // Search related
    searchForm,
    searchColumns: formColumns,
    proSearchFormProps,
    // Sort related
    sorting,
    onSortChange,
    // Methods
    getData,
    getDataByPage,
    reload: onChange,
    reloadColumns,
    updateSearchValues
  };
}

type FieldTransformer = (value: any, record?: any) => any;

type UseProTableOperateOptions<
  TableData extends Record<string, any>,
  FormData extends Record<string, any>,
  OperateType extends string
> = {
  /** 表格数据 */
  data: Ref<TableData[]>;
  /** 主键字段名 */
  idKey: keyof TableData;
  /** 刷新数据方法 */
  getData: () => Promise<void>;
  /** 表单提交回调 */
  onSubmit?: (
    values: FormData,
    type: OperateType,
    form: ReturnType<typeof createProModalForm<FormData>>
  ) => Promise<void>;
  /** 删除操作回调 */
  onDelete?: (id: number) => Promise<{ error?: string | null }>;
  /** 提交成功后的消息提示 */
  successMessage?: Partial<Record<OperateType, string>>;
  /** 字段类型转换配置 */
  fieldTypeTransform?: Record<string, FieldTransformer>;
  /** 表单值变化回调（手动交互触发） */
  onValueChange?: (
    opt: { value: any; path: string },
    form: ReturnType<typeof createProModalForm<FormData>>,
    operateType: OperateType
  ) => void;
};

/**
 * 表格行操作的 Hook（模态框表单）
 */
export function useProTableOperate<
  TableData extends Record<string, any>,
  FormData extends Record<string, any> = TableData,
  OperateType extends string = NaiveUI.TableOperateType
>(options: UseProTableOperateOptions<TableData, FormData, OperateType>) {
  const { data, idKey, getData, onSubmit, onDelete, successMessage, fieldTypeTransform, onValueChange } = options;
  const { loading: formLoading, startLoading, endLoading } = useLoading(false);

  const operateType = shallowRef<OperateType>('add' as OperateType);

  /** the editing row data */
  const editingData = shallowRef<TableData | null>(null);

  const modalForm = createProModalForm<FormData>({
    onValueChange: opt => {
      if (onValueChange) {
        onValueChange(opt, modalForm, operateType.value);
      }
    },
    onSubmit: async values => {
      if (!onSubmit) return;
      startLoading();
      try {
        await onSubmit(values, operateType.value, modalForm);

        // 成功后关闭弹窗
        modalForm.show.value = false;

        // 显示成功消息
        const customMessage = successMessage?.[operateType.value as OperateType];
        if (customMessage) {
          window.$message?.success(customMessage);
        } else if (operateType.value === 'add') {
          window.$message?.success($t('common.addSuccess'));
        } else {
          window.$message?.success($t('common.modifySuccess'));
        }

        await getData();
      } catch {
        // 请求失败时不关闭弹窗，错误提示由请求层处理
      } finally {
        endLoading();
      }
    }
  });

  /**
   * 应用字段类型转换
   */
  function applyFieldTransform<T extends Record<string, any>, R = T>(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    data: T,
    transforms?: Record<string, FieldTransformer>
  ): R {
    if (!transforms) return data as unknown as R;

    const result = { ...data } as Record<string, any>;

    Object.entries(transforms).forEach(([field, transformer]) => {
      const value = data[field as keyof T];
      if (value !== null) {
        // Pass both value and full record to transformer
        result[field] = transformer(value, data);
      }
    });

    return result as R;
  }

  /**
   * 打开表单弹窗
   */
  function openFormModal() {
    modalForm.show.value = true;
  }

  /** 关闭表单弹窗 */
  function closeFormModal() {
    modalForm.show.value = false;
  }

  /** 新增快捷方法 */
  function handleAdd(initialValues?: Partial<FormData>) {
    operateType.value = 'add';
    editingData.value = null;
    modalForm.values.value = (initialValues ? { ...initialValues } : {}) as FormData;

    openFormModal();
  }

  /** 编辑快捷方法 */
  function handleEdit(id: TableData[keyof TableData], operate: string = 'edit') {
    const findItem = data.value.find(item => item[idKey] === id) || null;
    if (!findItem) {
      return;
    }

    operateType.value = operate;
    editingData.value = jsonClone(findItem) as TableData;
    modalForm.values.value = applyFieldTransform<TableData, FormData>(editingData.value, fieldTypeTransform);

    openFormModal();
  }

  /** the checked row keys of table */
  const checkedRowKeys = shallowRef<string[] | number[]>([]);

  /** the hook after the batch delete operation is completed */
  async function onBatchDeleted() {
    window.$message?.success($t('common.deleteSuccess'));
    checkedRowKeys.value = [];
    await getData();
  }

  /** the hook after the delete operation is completed */
  async function onDeleted() {
    window.$message?.success($t('common.deleteSuccess'));
    await getData();
  }

  /** 删除快捷方法 */
  async function handleDelete(id: number) {
    if (!onDelete) {
      throw new Error('onDelete callback is required for handleDelete');
    }

    const { error } = await onDelete(id);
    if (error) {
      throw error;
    }

    // 显示成功消息
    window.$message?.success($t('common.deleteSuccess'));

    // 刷新数据
    await getData();
  }

  return {
    /** 操作类型 */
    operateType,
    /** modal 表单实例 */
    modalForm,
    /** 表单加载状态 */
    formLoading,
    /** 打开表单弹窗（支持自定义类型） */
    openFormModal,
    /** 关闭表单弹窗 */
    closeFormModal,
    /** 新增快捷方法 */
    handleAdd,
    /** 编辑快捷方法 */
    handleEdit,
    /** 删除快捷方法 */
    handleDelete,
    /** 编辑中的行数据 */
    editingData,
    /** 选中的行 keys */
    checkedRowKeys,
    /** 批量删除后回调 */
    onBatchDeleted,
    /** 删除后回调 */
    onDeleted
  };
}

// ===================== Helper Functions =====================

const SELECTION_KEY = '__selection__';
const EXPAND_KEY = '__expand__';

/** 从列定义生成 columnChecks */
function getColumnChecks<T>(cols: ProDataTableColumns<T>): TableColumnCheck[] {
  const checks: TableColumnCheck[] = [];

  cols.forEach(column => {
    if ('key' in column && column.key) {
      checks.push({
        key: column.key as string,
        title: column.title as string,
        checked: true,
        visible: true
      });
    } else if ('type' in column && column.type === 'selection') {
      checks.push({
        key: SELECTION_KEY,
        title: $t('common.check'),
        checked: true,
        visible: false
      });
    } else if ('type' in column && column.type === 'expand') {
      checks.push({
        key: EXPAND_KEY,
        title: $t('common.expandColumn'),
        checked: true,
        visible: false
      });
    }
  });

  return checks;
}

/** 根据 columnChecks 过滤并排序列 */
function getFilteredColumns<T>(cols: ProDataTableColumns<T>, checks: TableColumnCheck[]): ProDataTableColumns<T> {
  // 创建列映射
  const columnMap = new Map<string, ProDataTableColumns<T>[number]>();
  cols.forEach(column => {
    if ('key' in column && column.key) {
      columnMap.set(column.key as string, column);
    } else if ('type' in column && column.type === 'selection') {
      columnMap.set(SELECTION_KEY, column);
    } else if ('type' in column && column.type === 'expand') {
      columnMap.set(EXPAND_KEY, column);
    }
  });

  // 按 checks 顺序返回已勾选的列
  return checks.filter(check => check.checked && columnMap.has(check.key)).map(check => columnMap.get(check.key)!);
}

/** 日期参数映射：天数偏移 */
const DATE_OFFSET_MAP: Record<string, number> = {
  today: 0,
  yesterday: 1
};

/** 处理 URL date 参数，自动设置日期范围 */
function handleDateParam<SearchParams extends Record<string, any>>(
  searchForm: ReturnType<typeof createProSearchForm<SearchParams>>,
  query: Record<string, any>,
  options?: DateParamOptions<SearchParams>
) {
  const paramName = options?.paramName || 'date';
  const targetField = String(options?.targetField || 'created_at');
  const dateValue = query[paramName];

  // 检查 date 参数是否有效
  if (typeof dateValue !== 'string' || !(dateValue in DATE_OFFSET_MAP)) {
    return;
  }

  // 计算日期范围
  const days = DATE_OFFSET_MAP[dateValue];
  const dateRange = [getDateSubtract(days, 'start'), getDateSubtract(days, 'end')];

  // 设置日期范围到表单字段
  if (targetField in searchForm.values.value) {
    (searchForm.values.value as Record<string, any>)[targetField] = dateRange;
  }
}
