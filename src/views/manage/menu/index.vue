<script setup lang="tsx">
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { createAdminMenu, destroyAdminMenu, fetchAdminMenuList, updateAdminMenu } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useProPaginatedTable, useProTableOperate } from '@/hooks/common/pro-table';
import { $t } from '@/locales';
import MenuForm from './components/menu-form.vue';

defineOptions({
  name: 'ManageMenu'
});

const appStore = useAppStore();

const operateTypeTitle: Record<NaiveUI.TableOperateType, string> = {
  add: $t('page.manageAdminMenu.addTitle'),
  edit: $t('page.manageAdminMenu.editTitle')
};

const menuTypeOptions = [
  { label: '目录', value: 'directory' },
  { label: '菜单', value: 'menu' },
  { label: '按钮', value: 'button' }
];

const { columns, columnChecks, data, loading, tableProps, searchForm, searchColumns, proSearchFormProps, getData } =
  useProPaginatedTable<Api.SystemManage.AdminMenu, Api.SystemManage.AdminMenuSearchParams>({
    api: fetchAdminMenuList,
    defaultCurrent: 1,
    defaultPageSize: 20,
    initialSearchValues: {
      name: null,
      type: null,
      status: null
    },
    searchColumns: () => [
      {
        title: $t('page.manageAdminMenu.name'),
        path: 'name',
        span: 2
      },
      {
        title: $t('page.manageAdminMenu.type'),
        path: 'type',
        field: 'select',
        span: 2,
        fieldProps: () => ({
          options: menuTypeOptions
        })
      },
      {
        title: $t('page.manageAdminMenu.status'),
        path: 'status',
        field: 'select',
        span: 2,
        fieldProps: () => ({
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 }
          ]
        })
      }
    ],
    columns: () => [
      {
        key: 'id',
        title: 'ID',
        align: 'center',
        width: 80,
        sorter: true
      },
      {
        key: 'name',
        title: $t('page.manageAdminMenu.name'),
        align: 'center',
        minWidth: 150
      },
      {
        key: 'parent_id',
        title: $t('page.manageAdminMenu.parent'),
        align: 'center',
        width: 100,
        render: row => {
          return row.parent_id || '-';
        }
      },
      {
        key: 'type',
        title: $t('page.manageAdminMenu.type'),
        align: 'center',
        width: 100,
        render: row => {
          const typeLabels: Record<string, string> = {
            directory: '目录',
            menu: '菜单',
            button: '按钮'
          };
          return <NTag type="info">{typeLabels[row.type] || row.type}</NTag>;
        }
      },
      {
        key: 'icon',
        title: $t('page.manageAdminMenu.icon'),
        align: 'center',
        width: 100,
        render: row => {
          return row.icon || '-';
        }
      },
      {
        key: 'route_name',
        title: $t('page.manageAdminMenu.routeName'),
        align: 'center',
        minWidth: 150,
        render: row => {
          return row.route_name || '-';
        }
      },
      {
        key: 'route_path',
        title: $t('page.manageAdminMenu.routePath'),
        align: 'center',
        minWidth: 200,
        render: row => {
          return row.route_path || '-';
        }
      },
      {
        key: 'component',
        title: $t('page.manageAdminMenu.component'),
        align: 'center',
        minWidth: 200,
        render: row => {
          return row.component || '-';
        }
      },
      {
        key: 'sorting',
        title: $t('page.manageAdminMenu.sorting'),
        align: 'center',
        width: 80
      },
      {
        key: 'status',
        title: $t('page.manageAdminMenu.status'),
        align: 'center',
        width: 80,
        render: row => {
          const status = row.status as number;
          const tagTypes: Record<number, NaiveUI.ThemeColor> = {
            0: 'error',
            1: 'success'
          };
          return <NTag type={tagTypes[status]}>{status === 1 ? '启用' : '禁用'}</NTag>;
        }
      },
      {
        key: 'actions',
        title: $t('common.operate'),
        align: 'center',
        width: 150,
        fixed: 'right' as const,
        render: row => (
          <NSpace justify="center">
            <NButton size="small" type="primary" ghost onClick={() => edit(row.id)}>
              {$t('common.edit')}
            </NButton>
            <NPopconfirm onPositiveClick={() => remove(row.id)}>
              {{
                default: () => $t('page.manageAdminMenu.confirmDelete'),
                trigger: () => (
                  <NButton size="small" type="error">
                    {$t('common.delete')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          </NSpace>
        )
      }
    ]
  });

const { operateType, modalForm, formLoading, handleAdd, handleEdit, handleDelete } = useProTableOperate<
  Api.SystemManage.AdminMenu,
  Api.SystemManage.AdminMenu,
  NaiveUI.TableOperateType
>({
  data,
  idKey: 'id',
  getData,
  onSubmit: async (values, type, form) => {
    const id = form.values.value.id!;

    const handlers: Record<NaiveUI.TableOperateType, () => Promise<any>> = {
      add: () => createAdminMenu(values),
      edit: () => updateAdminMenu(id, values)
    };
    const { error } = await handlers[type]();
    if (error) throw error;
  },
  onDelete: async id => {
    const { error } = await destroyAdminMenu(id);
    if (error) throw error;
    return { error: null };
  }
});

function add() {
  handleAdd({ status: 1, sorting: 0, parent_id: 0 });
}

function edit(id: number) {
  handleEdit(id);
}

function remove(id: number) {
  handleDelete(id);
}
</script>

<template>
  <ConfigProvider>
    <NFlex class="h-full" vertical size="large">
      <ProCard title="筛选条件" class="mb-10px" content-class="pb-0!">
        <ProSearchForm :form="searchForm" :columns="searchColumns" v-bind="proSearchFormProps" />
      </ProCard>
      <ProDataTable title="菜单列表" row-key="id" v-bind="tableProps" :columns="columns">
        <template #toolbar>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @add="add" @refresh="getData" />
        </template>
      </ProDataTable>
      <ProDrawerForm
        :form="modalForm"
        label-placement="left"
        label-align="right"
        label-width="120"
        :loading="formLoading"
        :width="appStore.isMobile ? '100%' : 500"
      >
        <ProDrawerContent :title="operateTypeTitle[operateType]" :native-scrollbar="false">
          <MenuForm :type="operateType" />
        </ProDrawerContent>
      </ProDrawerForm>
    </NFlex>
  </ConfigProvider>
</template>

<style scoped></style>
