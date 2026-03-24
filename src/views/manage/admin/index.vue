<script setup lang="tsx">
import { NButton, NPopconfirm } from 'naive-ui';
import type { JSX } from 'vue/jsx-runtime';
import { adminStatusLabels, adminStatusOptions } from '@/constants/business';
import { createAdmin, fetchAdminList, updateAdmin, updateAdminPassword } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useProPaginatedTable, useProTableOperate } from '@/hooks/common/pro-table';
import { getRouteQueryParams } from '@/utils/common';
import { toDatetimeRangeFieldProps } from '@/utils/date';
import { $t } from '@/locales';
import AdminOperateForm from './modules/admin-operate-form.vue';

type OperateType = 'add' | 'edit' | 'password';

const appStore = useAppStore();

const operateTypeTitle: Record<OperateType, string> = {
  add: '新增管理员信息',
  edit: '修改管理员信息',
  password: '修改管理员密码'
};

const { columns, columnChecks, data, loading, tableProps, searchForm, searchColumns, proSearchFormProps, getData } =
  useProPaginatedTable<Api.SystemManage.Admin, Api.SystemManage.AdminSearchParams>({
    api: fetchAdminList,
    defaultCurrent: 1,
    defaultPageSize: 20,
    extraParams: getRouteQueryParams('id'),
    initialSearchValues: {
      username: null,
      mobile: null,
      status: null
    },
    searchColumns: () => [
      {
        title: '用户名',
        path: 'username',
        span: 2
      },
      {
        title: '手机号码',
        path: 'mobile',
        span: 2
      },
      {
        title: '状态',
        path: 'status',
        span: 2,
        field: 'select',
        fieldProps: () => {
          return {
            options: adminStatusOptions
          };
        }
      },
      {
        title: '创建时间',
        path: 'created_at',
        field: 'date-time-range',
        span: 4,
        fieldProps: () => toDatetimeRangeFieldProps()
      }
    ],
    columns: () => [
      {
        key: 'id',
        title: '主键',
        align: 'center',
        width: 80
      },
      {
        key: 'username',
        title: '用户名',
        align: 'center',
        minWidth: 120
      },
      {
        key: 'real_name',
        title: '姓名',
        align: 'center',
        minWidth: 120
      },
      {
        key: 'mobile',
        title: '手机号码',
        align: 'center',
        minWidth: 160
      },
      {
        key: 'status',
        title: '状态',
        align: 'center',
        minWidth: 120,
        render: row => {
          const status = row.status as number;
          const tagTypes: Record<number, NaiveUI.ThemeColor> = {
            0: 'error',
            1: 'success'
          };

          return <NTag type={tagTypes[status]}>{adminStatusLabels[status]}</NTag>;
        }
      },
      {
        key: 'last_login_at',
        title: '最后登录时间',
        align: 'center',
        minWidth: 200,
        render: row => {
          return <DateFormat date={row.last_login_at} />;
        }
      },
      {
        key: 'created_at',
        title: '创建时间',
        align: 'center',
        minWidth: 200,
        render: row => {
          return <DateFormat date={row.created_at} />;
        }
      },
      {
        key: 'operate',
        title: $t('common.operate'),
        align: 'center',
        width: 260,
        render: row => {
          let updateStatusElement: JSX.Element = <></>;

          if (row.status) {
            updateStatusElement = (
              <NPopconfirm onPositiveClick={() => editStatus(row, 0)}>
                {{
                  default: () => '确认禁用',
                  trigger: () => (
                    <NButton size={'small'} type={'error'}>
                      禁用
                    </NButton>
                  )
                }}
              </NPopconfirm>
            );
          } else {
            updateStatusElement = (
              <NPopconfirm onPositiveClick={() => editStatus(row, 1)}>
                {{
                  default: () => '确认启用',
                  trigger: () => (
                    <NButton size={'small'} type={'info'}>
                      启用
                    </NButton>
                  )
                }}
              </NPopconfirm>
            );
          }

          return (
            <NSpace justify={'center'}>
              <NButton size={'small'} type={'info'} onClick={() => edit(row)}>
                修改信息
              </NButton>
              <NButton size={'small'} type={'warning'} onClick={() => editPassword(row)}>
                修改密码
              </NButton>
              {updateStatusElement}
            </NSpace>
          );
        }
      }
    ]
  });

const { operateType, modalForm, formLoading, handleEdit, handleAdd, closeFormModal, checkedRowKeys } =
  useProTableOperate<Api.SystemManage.Admin, Api.SystemManage.Admin, OperateType>({
    data,
    idKey: 'id',
    getData,
    onSubmit: async (values, type, form) => {
      const id = form.values.value.id!;
      const handlers: Record<OperateType, () => Promise<any>> = {
        add: () => createAdmin(values),
        edit: () => updateAdmin(id, values),
        password: () => updateAdminPassword(id, values)
      };
      const { error } = await handlers[type]();
      if (error) throw error;
    },
    successMessage: {
      password: '密码修改成功'
    }
  });

function edit(row: Api.SystemManage.Admin) {
  handleEdit(row.id);
}

function editPassword(row: Api.SystemManage.Admin) {
  handleEdit(row.id, 'password');
}

async function editStatus(row: Api.SystemManage.Admin, status: number) {
  await updateAdmin(row.id, { status });
  window.$message?.success($t('common.modifySuccess'));
  await getData();
}
</script>

<template>
  <ConfigProvider>
    <NFlex class="h-full" vertical size="large">
      <ProCard title="筛选条件" class="mb-10px" content-class="pb-0!">
        <ProSearchForm :form="searchForm" :columns="searchColumns" v-bind="proSearchFormProps" />
      </ProCard>
      <ProDataTable
        v-model:checked-row-keys="checkedRowKeys"
        title="管理员列表"
        row-key="id"
        v-bind="tableProps"
        :columns="columns"
      >
        <template #toolbar>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :loading="loading"
            :show-delete="false"
            @add="handleAdd"
            @refresh="getData"
          />
        </template>
      </ProDataTable>
      <ProDrawerForm
        :form="modalForm"
        label-placement="left"
        label-align="right"
        label-width="120"
        :loading="formLoading"
        :width="appStore.isMobile ? '100%' : undefined"
        @mask-click="closeFormModal"
      >
        <ProDrawerContent :title="operateTypeTitle[operateType]" :native-scrollbar="false">
          <AdminOperateForm :type="operateType" />
        </ProDrawerContent>
      </ProDrawerForm>
    </NFlex>
  </ConfigProvider>
</template>

<style scoped></style>
