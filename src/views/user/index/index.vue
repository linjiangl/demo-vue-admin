<script setup lang="tsx">
import { userStatusLabels, userStatusOptions } from '@/constants/business';
import { fetchUserList } from '@/service/api';
import { useProPaginatedTable } from '@/hooks/common/pro-table';
import { toDatetimeRangeFieldProps } from '@/utils/date';
import TableActions from './components/table-actions.vue';
import TableExpand from './components/table-expand.vue';

const {
  columns,
  columnChecks,
  loading,
  tableProps,
  searchForm,
  searchColumns,
  proSearchFormProps,
  getData,
  onSortChange
} = useProPaginatedTable<Api.User.User, Api.User.UserSearchParams>({
  api: fetchUserList,
  defaultCurrent: 1,
  defaultPageSize: 20,
  initialSearchValues: {
    id: null,
    uuid: null,
    username: null,
    mobile: null,
    email: null,
    status: null,
    created_at: null
  },
  searchColumns: () => [
    {
      title: 'ID',
      path: 'id',
      span: 2
    },
    {
      title: 'UUID',
      path: 'uuid',
      span: 2
    },
    {
      title: '用户名',
      path: 'username',
      span: 2
    },
    {
      title: '手机号',
      path: 'mobile',
      span: 2
    },
    {
      title: '邮箱',
      path: 'email',
      span: 2
    },
    {
      title: '状态',
      path: 'status',
      field: 'select',
      span: 2,
      fieldProps: () => ({
        options: userStatusOptions
      })
    },
    {
      title: '注册时间',
      path: 'created_at',
      field: 'date-time-range',
      span: 4,
      fieldProps: () => toDatetimeRangeFieldProps()
    }
  ],
  columns: () => [
    {
      type: 'expand',
      renderExpand: row => {
        return <TableExpand user={row} />;
      }
    },
    {
      key: 'id',
      title: 'ID',
      align: 'center',
      minWidth: 100,
      sorter: true
    },
    {
      key: 'avatar',
      title: '头像',
      align: 'center',
      minWidth: 80,
      render: row => <ImageAvatar src={row.avatar_url} />
    },
    {
      key: 'username',
      title: '用户名',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'nickname',
      title: '昵称',
      align: 'center',
      minWidth: 120
    },
    {
      key: 'uuid',
      title: 'UUID',
      align: 'center',
      minWidth: 200
    },
    {
      key: 'mobile',
      title: '手机号',
      align: 'center',
      minWidth: 160
    },
    {
      key: 'email',
      title: '邮箱',
      align: 'center',
      minWidth: 160
    },
    {
      key: 'status',
      title: '状态',
      align: 'center',
      minWidth: 80,
      render: row => {
        const status = row.status as number;
        const tagTypes: Record<number, NaiveUI.ThemeColor> = {
          0: 'error',
          1: 'success',
          30: 'warning',
          31: 'info',
          32: 'default'
        };
        return <NTag type={tagTypes[status]}>{userStatusLabels[status]}</NTag>;
      }
    },
    {
      key: 'created_at',
      title: '注册时间',
      align: 'center',
      minWidth: 160,
      render: row => <DateFormat date={row.created_at} />
    },
    {
      key: 'updated_at',
      title: '更新时间',
      align: 'center',
      minWidth: 160,
      render: row => <DateFormat date={row.updated_at} />
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      minWidth: 120,
      render: row => {
        return <TableActions user={row} onReload={getData} />;
      }
    }
  ]
});
</script>

<template>
  <ConfigProvider>
    <NFlex class="h-full" vertical size="large">
      <ProCard title="筛选条件" class="mb-10px" content-class="pb-0!">
        <ProSearchForm :form="searchForm" :columns="searchColumns" v-bind="proSearchFormProps" />
      </ProCard>
      <ProDataTable title="用户列表" row-key="id" v-bind="tableProps" :columns="columns" @update:sorter="onSortChange">
        <template #toolbar>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :loading="loading"
            :show-add="false"
            :show-delete="false"
            @refresh="getData"
          />
        </template>
      </ProDataTable>
    </NFlex>
  </ConfigProvider>
</template>

<style scoped></style>
