import { computed, effectScope, onScopeDispose, reactive, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import type { PaginationProps } from 'naive-ui';
import { useLoading, useTable } from '@sa/hooks';
import type { PaginationData, TableColumnCheck, UseTableOptions } from '@sa/hooks';
import type { FlatResponseData } from '@sa/axios';
import type { ProSearchFormColumns } from 'pro-naive-ui';
import { createProModalForm, createProSearchForm } from 'pro-naive-ui';
import { jsonClone } from '@sa/utils';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';

export type UseNaiveTableOptions<ResponseData, ApiData, Pagination extends boolean> = Omit<
  UseTableOptions<ResponseData, ApiData, NaiveUI.TableColumn<ApiData>, Pagination>,
  'pagination' | 'getColumnChecks' | 'getColumns'
> & {
  /**
   * get column visible
   *
   * @param column
   *
   * @default true
   *
   * @returns true if the column is visible, false otherwise
   */
  getColumnVisible?: (column: NaiveUI.TableColumn<ApiData>) => boolean;
};

type PaginationParams = Pick<PaginationProps, 'page' | 'pageSize'>;

type PaginatedRequestParams<SearchParams extends object> = SearchParams & {
  current: number;
  size: number;
  sorting?: string;
};

type SearchInitialValues<SearchParams extends object> = Partial<PaginatedRequestParams<SearchParams>>;

type SearchOnceValues<SearchParams extends object> = Partial<{
  [Key in keyof SearchParams]: SearchParams[Key] | string | number | boolean | null;
}>;

type TableSorter = {
  columnKey?: string | number;
  order?: 'ascend' | 'descend' | false | null;
};

type DefaultPaginatedResponseData<ApiData> = FlatResponseData<
  App.Service.Response<Api.Common.PaginatingQueryRecord<ApiData>>,
  Api.Common.PaginatingQueryRecord<ApiData>
>;

type FieldTransformer<TableData extends Record<string, unknown>> = (value: unknown, record: TableData) => unknown;

type DefaultTableIdKey<TableData extends Record<string, unknown>> =
  Extract<'id', keyof TableData> extends never ? keyof TableData : Extract<'id', keyof TableData>;

type UseTableOperateOptions<
  TableData extends Record<string, unknown>,
  FormData extends Record<string, unknown>,
  OperateType extends string,
  IdKey extends keyof TableData
> = {
  data: Ref<TableData[]>;
  getData: () => Promise<void>;
  onSubmit?: (
    values: FormData,
    type: OperateType,
    form: ReturnType<typeof createProModalForm<FormData>>
  ) => Promise<void>;
  onDelete?: (id: TableData[IdKey]) => Promise<{ error?: unknown }>;
  successMessage?: Partial<Record<OperateType, string>>;
  fieldTypeTransform?: Record<string, FieldTransformer<TableData>>;
  onValueChange?: (
    opt: { value: unknown; path: string },
    form: ReturnType<typeof createProModalForm<FormData>>,
    operateType: OperateType
  ) => void;
} & ('id' extends keyof TableData ? { idKey?: IdKey } : { idKey: IdKey });

type UseNaivePaginatedTableOptions<
  ApiData,
  SearchParams extends object = Record<string, never>,
  ResponseData = DefaultPaginatedResponseData<ApiData>
> = Omit<UseNaiveTableOptions<ResponseData, ApiData, true>, 'api' | 'transform'> & {
  api: (params: PaginatedRequestParams<SearchParams>) => Promise<ResponseData>;
  searchColumns?: () => ProSearchFormColumns<SearchParams>;
  searchInitialValues?: SearchInitialValues<SearchParams>;
  searchOnceValues?: SearchOnceValues<SearchParams>;
  searchDefaultCollapsed?: boolean;
  defaultSortBy?: string;
  defaultOrder?: 'asc' | 'desc';
  transform?: UseNaiveTableOptions<ResponseData, ApiData, true>['transform'];
  paginationProps?: Omit<PaginationProps, 'page' | 'pageSize' | 'itemCount'>;
  /**
   * whether to show the total count of the table
   *
   * @default true
   */
  showTotal?: boolean;
  onPaginationParamsChange?: (params: PaginationParams) => void | Promise<void>;
};

const SELECTION_KEY = '__selection__';

const EXPAND_KEY = '__expand__';

export function useNaiveTable<ResponseData, ApiData>(options: UseNaiveTableOptions<ResponseData, ApiData, false>) {
  const scope = effectScope();
  const appStore = useAppStore();

  const result = useTable<ResponseData, ApiData, NaiveUI.TableColumn<ApiData>, false>({
    ...options,
    getColumnChecks: cols => getColumnChecks(cols, options.getColumnVisible),
    getColumns
  });

  // calculate the total width of the table this is used for horizontal scrolling
  const scrollX = computed(() => getScrollX(result.columns.value));

  scope.run(() => {
    watch(
      () => appStore.locale,
      () => {
        result.reloadColumns();
      }
    );
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    ...result,
    scrollX
  };
}

export function useNaivePaginatedTable<
  ApiData,
  SearchParams extends object = Record<string, never>,
  ResponseData = DefaultPaginatedResponseData<ApiData>
>(options: UseNaivePaginatedTableOptions<ApiData, SearchParams, ResponseData>) {
  const scope = effectScope();
  const appStore = useAppStore();
  const initialSearchParams = { ...(options.searchInitialValues ?? {}) };
  const { current: initialCurrent, size: initialSize, ...searchFormInitialValues } = initialSearchParams;
  const resolvedPageSize = Number(initialSize ?? 10);
  const searchOnceValues = omitNilFields(options.searchOnceValues ?? {});
  const hasSearchOnceValues = Object.keys(searchOnceValues).length > 0;
  const shouldAutoFetch = options.immediate ?? true;
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const sorting = shallowRef<string | undefined>(
    options.defaultSortBy && options.defaultOrder
      ? `${options.defaultSortBy}-${options.defaultOrder === 'asc' ? 'ascend' : 'descend'}`
      : undefined
  );

  const isMobile = computed(() => appStore.isMobile);

  const showTotal = computed(() => options.showTotal ?? true);

  const pagination = reactive({
    page: Number(initialCurrent ?? 1),
    pageSize: resolvedPageSize,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 15, 20, 25, 30],
    prefix: showTotal.value ? page => $t('datatable.itemCount', { total: page.itemCount }) : undefined,
    onUpdatePage(page) {
      pagination.page = page;
    },
    onUpdatePageSize(pageSize) {
      pagination.pageSize = pageSize;
      pagination.page = 1;
    },
    ...options.paginationProps
  }) as PaginationProps;

  // this is for mobile, if the system does not support mobile, you can use `pagination` directly
  const mobilePagination = computed(() => {
    const p: PaginationProps = {
      ...pagination,
      pageSlot: isMobile.value ? 3 : 9,
      prefix: !isMobile.value && showTotal.value ? pagination.prefix : undefined
    };

    return p;
  });

  const paginationParams = computed(() => {
    const { page, pageSize } = pagination;

    return {
      page,
      pageSize
    };
  });

  const searchForm = createProSearchForm<SearchParams>({
    initialValues: searchFormInitialValues as SearchParams,
    defaultCollapsed: options.searchDefaultCollapsed,
    async onSubmit() {
      await getDataByPage(1);
    },
    async onReset() {
      await getDataByPage(1);
    }
  });

  const requestParams = computed<PaginatedRequestParams<SearchParams>>(() => {
    return {
      ...(sorting.value ? { sorting: sorting.value } : {}),
      ...omitNilFields(searchForm.values.value as SearchParams),
      current: Number(pagination.page ?? 1),
      size: Number(pagination.pageSize ?? resolvedPageSize)
    } as PaginatedRequestParams<SearchParams>;
  });

  const result = useTable<ResponseData, ApiData, NaiveUI.TableColumn<ApiData>, true>({
    ...options,
    api: () => options.api(requestParams.value),
    immediate: hasSearchOnceValues ? false : shouldAutoFetch,
    transform:
      options.transform ??
      ((response: ResponseData) =>
        defaultTransform(
          response as FlatResponseData<
            App.Service.Response<Api.Common.PaginatingQueryRecord<ApiData>>,
            Api.Common.PaginatingQueryRecord<ApiData>
          >
        )),
    pagination: true,
    getColumnChecks: cols => getColumnChecks(cols, options.getColumnVisible),
    getColumns,
    onFetched: data => {
      pagination.itemCount = data.total;
    }
  });

  if (hasSearchOnceValues) {
    Object.assign(searchForm.values.value, searchOnceValues);

    if (shouldAutoFetch) {
      result.getData();
    }
  }

  const scrollX = computed(() => getScrollX(result.columns.value));

  const searchColumns = computed(() => {
    const cols = options.searchColumns?.() ?? [];
    const spanMultiplier = breakpoints.smaller('2xl').value ? 2 : 1;

    if (spanMultiplier === 1) {
      return cols;
    }

    return cols.map(column => ({
      ...column,
      span: typeof column.span === 'number' ? column.span * spanMultiplier : column.span
    }));
  });

  const searchFormProps = computed(() => {
    return {};
  });

  const tableProps = computed(() => {
    return {
      data: result.data.value,
      loading: result.loading.value,
      remote: true,
      pagination: mobilePagination.value,
      scrollX: scrollX.value
    };
  });

  async function getDataByPage(page: number = 1) {
    if (page !== pagination.page) {
      pagination.page = page;

      return;
    }

    await result.getData();
  }

  function searchUpdateValues(values: Partial<SearchParams>, triggerSearch = true) {
    Object.assign(searchForm.values.value, values);

    if (triggerSearch) {
      return getDataByPage(1);
    }

    return Promise.resolve();
  }

  async function updateSorting(sorter: TableSorter | TableSorter[] | null) {
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    sorting.value =
      currentSorter?.order && currentSorter.columnKey
        ? `${String(currentSorter.columnKey)}-${currentSorter.order}`
        : undefined;

    await getDataByPage(1);
  }

  scope.run(() => {
    watch(
      () => appStore.locale,
      () => {
        result.reloadColumns();
      }
    );

    watch(paginationParams, async newVal => {
      await options.onPaginationParamsChange?.(newVal);

      await result.getData();
    });
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    ...result,
    scrollX,
    searchForm,
    searchColumns,
    searchUpdateValues,
    searchFormProps,
    tableProps,
    updateSorting,
    getDataByPage,
    sorting,
    pagination,
    mobilePagination
  };
}

export function useTableOperate<
  TableData extends Record<string, unknown>,
  FormData extends Record<string, unknown> = TableData,
  OperateType extends string = NaiveUI.TableOperateType,
  IdKey extends keyof TableData = DefaultTableIdKey<TableData>
>(options: UseTableOperateOptions<TableData, FormData, OperateType, IdKey>) {
  const { data, getData, onSubmit, onDelete, successMessage, fieldTypeTransform, onValueChange } = options;
  const idKey = (options.idKey ?? 'id') as IdKey;
  const { loading: formLoading, startLoading, endLoading } = useLoading(false);

  const operateType = shallowRef<OperateType>('add' as OperateType);

  /** the editing row data */
  const editingData = shallowRef<TableData | null>(null);

  const form = createProModalForm<FormData>({
    onValueChange: opt => {
      onValueChange?.(opt, form, operateType.value);
    },
    onSubmit: async values => {
      if (!onSubmit) return;

      startLoading();

      try {
        await onSubmit(values, operateType.value, form);

        form.show.value = false;

        const customMessage = successMessage?.[operateType.value as OperateType];

        if (customMessage) {
          window.$message?.success(customMessage);
        } else if (operateType.value === 'add') {
          window.$message?.success($t('common.addSuccess'));
        } else {
          window.$message?.success($t('common.modifySuccess'));
        }

        await getData();
      } finally {
        endLoading();
      }
    }
  });

  function applyFieldTransform<T extends Record<string, unknown>, R = T>(
    source: T,
    transforms?: Record<string, FieldTransformer<TableData>>
  ): R {
    if (!transforms) {
      return source as unknown as R;
    }

    const result = { ...source } as Record<string, unknown>;

    Object.entries(transforms).forEach(([field, transformer]) => {
      const value = source[field as keyof T];

      if (value !== null) {
        result[field] = transformer(value, source as unknown as TableData);
      }
    });

    return result as R;
  }

  function openForm() {
    form.show.value = true;
  }

  function closeForm() {
    form.show.value = false;
  }

  function handleAdd(initialValues?: Partial<FormData>, type: OperateType = 'add' as OperateType) {
    operateType.value = type;
    editingData.value = null;
    form.values.value = (initialValues ? { ...initialValues } : {}) as FormData;

    openForm();
  }

  function handleEdit(id: TableData[IdKey], type: OperateType = 'edit' as OperateType) {
    const findItem = data.value.find(item => item[idKey] === id) || null;

    if (!findItem) {
      return;
    }

    operateType.value = type;
    editingData.value = jsonClone(findItem) as TableData;
    form.values.value = applyFieldTransform<TableData, FormData>(editingData.value, fieldTypeTransform);

    openForm();
  }

  /** the checked row keys of table */
  const checkedRowKeys = shallowRef<Array<string | number>>([]);

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

  async function handleDelete(id: TableData[IdKey]) {
    if (!onDelete) {
      throw new Error('onDelete callback is required for handleDelete');
    }

    const { error } = await onDelete(id);

    if (error) {
      throw error;
    }

    window.$message?.success($t('common.deleteSuccess'));

    await getData();
  }

  return {
    operateType,
    form,
    formLoading,
    openForm,
    closeForm,
    handleAdd,
    editingData,
    handleEdit,
    handleDelete,
    checkedRowKeys,
    onBatchDeleted,
    onDeleted
  };
}

export function defaultTransform<ApiData>(
  response: FlatResponseData<
    App.Service.Response<Api.Common.PaginatingQueryRecord<ApiData>>,
    Api.Common.PaginatingQueryRecord<ApiData>
  >
): PaginationData<ApiData> {
  const { data, error } = response;

  if (!error) {
    const { records, current, size, total } = data;

    return {
      data: records,
      pageNum: current,
      pageSize: size,
      total
    };
  }

  return {
    data: [],
    pageNum: 1,
    pageSize: 10,
    total: 0
  };
}

function getColumnChecks<TableData>(
  cols: NaiveUI.TableColumn<TableData>[],
  getColumnVisible?: (column: NaiveUI.TableColumn<TableData>) => boolean
) {
  const checks: TableColumnCheck[] = [];

  cols.forEach(column => {
    if (isTableColumnHasKey(column)) {
      checks.push({
        key: column.key as string,
        title: column.title!,
        checked: true,
        visible: getColumnVisible?.(column) ?? true
      });
    } else if (column.type === 'selection') {
      checks.push({
        key: SELECTION_KEY,
        title: $t('common.check'),
        checked: true,
        visible: getColumnVisible?.(column) ?? false
      });
    } else if (column.type === 'expand') {
      checks.push({
        key: EXPAND_KEY,
        title: $t('common.expandColumn'),
        checked: true,
        visible: getColumnVisible?.(column) ?? false
      });
    }
  });

  return checks;
}

function getColumns<TableData>(cols: NaiveUI.TableColumn<TableData>[], checks: TableColumnCheck[]) {
  const columnMap = new Map<string, NaiveUI.TableColumn<TableData>>();

  cols.forEach(column => {
    if (isTableColumnHasKey(column)) {
      columnMap.set(column.key as string, column);
    } else if (column.type === 'selection') {
      columnMap.set(SELECTION_KEY, column);
    } else if (column.type === 'expand') {
      columnMap.set(EXPAND_KEY, column);
    }
  });

  const filteredColumns = checks
    .filter(item => item.checked)
    .map(check => columnMap.get(check.key) as NaiveUI.TableColumn<TableData>);

  return filteredColumns;
}

export function isTableColumnHasKey<T>(column: NaiveUI.TableColumn<T>): column is NaiveUI.TableColumnWithKey<T> {
  return Boolean((column as NaiveUI.TableColumnWithKey<T>).key);
}

function omitNilFields<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined)
  ) as Partial<T>;
}

function getScrollX<T>(columns: NaiveUI.TableColumn<T>[], minWidth: number = 120) {
  return columns.reduce((acc, column) => {
    return acc + Number(column.width ?? column.minWidth ?? minWidth);
  }, 0);
}
