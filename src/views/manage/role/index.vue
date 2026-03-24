<script setup lang="tsx">
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui';
import { createAdminRole, destroyAdminRole, fetchAdminRoleList, updateAdminRole } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useProPaginatedTable, useProTableOperate } from '@/hooks/common/pro-table';
import { $t } from '@/locales';
import RoleForm from './components/role-form.vue';

defineOptions({
  name: 'ManageRole'
});

const appStore = useAppStore();

const operateTypeTitle: Record<NaiveUI.TableOperateType, string> = {
  add: $t('page.manageAdminRole.addTitle'),
  edit: $t('page.manageAdminRole.editTitle')
};

const { columns, columnChecks, data, loading, tableProps, searchForm, searchColumns, proSearchFormProps, getData } =
  useProPaginatedTable<Api.SystemManage.AdminRole, Api.SystemManage.AdminRoleSearchParams>({
    api: fetchAdminRoleList,
    defaultCurrent: 1,
    defaultPageSize: 20,
    initialSearchValues: {
      name: null,
      identifier: null,
      status: null
    },
    searchColumns: () => [
      {
        title: $t('page.manageAdminRole.name'),
        path: 'name',
        span: 2
      },
      {
        title: $t('page.manageAdminRole.identifier'),
        path: 'identifier',
        span: 2
      },
      {
        title: $t('page.manageAdminRole.status'),
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
        title: $t('page.manageAdminRole.name'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'identifier',
        title: $t('page.manageAdminRole.identifier'),
        align: 'center',
        minWidth: 120
      },
      {
        key: 'is_super',
        title: $t('page.manageAdminRole.isSuper'),
        align: 'center',
        width: 100,
        render: row => {
          return row.is_super ? <NTag type="success">是</NTag> : <NTag type="default">否</NTag>;
        }
      },
      {
        key: 'is_system',
        title: $t('page.manageAdminRole.isSystem'),
        align: 'center',
        width: 100,
        render: row => {
          return row.is_system ? <NTag type="warning">是</NTag> : <NTag type="default">否</NTag>;
        }
      },
      {
        key: 'status',
        title: $t('page.manageAdminRole.status'),
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
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 160,
        render: row => <DateFormat date={row.created_at} />
      },
      {
        key: 'actions',
        title: $t('common.operate'),
        align: 'center',
        width: 160,
        fixed: 'right' as const,
        render: row => (
          <NSpace justify="center">
            <NButton size="small" type="primary" ghost onClick={() => edit(row.id)}>
              {$t('common.edit')}
            </NButton>
            {!row.is_system && (
              <NPopconfirm onPositiveClick={() => remove(row.id)}>
                {{
                  default: () => $t('page.manageAdminRole.confirmDelete'),
                  trigger: () => (
                    <NButton size="small" type="error">
                      {$t('common.delete')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
            )}
          </NSpace>
        )
      }
    ]
  });

const { operateType, modalForm, formLoading, handleAdd, handleEdit, handleDelete } = useProTableOperate<
  Api.SystemManage.AdminRole,
  Api.SystemManage.AdminRole,
  NaiveUI.TableOperateType
>({
  data,
  idKey: 'id',
  getData,
  onSubmit: async (values, type, form) => {
    const id = form.values.value.id!;

    const handlers: Record<NaiveUI.TableOperateType, () => Promise<any>> = {
      add: () => createAdminRole(values),
      edit: () => updateAdminRole(id, values)
    };
    const { error } = await handlers[type]();
    if (error) throw error;
  },
  onDelete: async id => {
    const { error } = await destroyAdminRole(id);
    if (error) throw error;
    return { error: null };
  }
});

function add() {
  handleAdd({ status: 1, is_super: 0, is_system: 0 });
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
      <ProDataTable title="角色列表" row-key="id" v-bind="tableProps" :columns="columns">
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
          <RoleForm :type="operateType" />
        </ProDrawerContent>
      </ProDrawerForm>
    </NFlex>
  </ConfigProvider>
</template>

<style scoped></style>
