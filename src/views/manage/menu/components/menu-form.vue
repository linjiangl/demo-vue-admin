<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchAdminMenuList } from '@/service/api';

export interface Props {
  type?: 'add' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'add'
});

const menuTypeOptions = [
  { label: '目录', value: 'directory' },
  { label: '菜单', value: 'menu' },
  { label: '按钮', value: 'button' }
];

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' }
];

// Fetch menu list for parent selection
const menuData = ref<Api.SystemManage.AdminMenuList | null>(null);

onMounted(async () => {
  const { data } = await fetchAdminMenuList({ current: 1, size: 1000 });
  menuData.value = data;
});

const parentMenuOptions = computed(() => {
  if (!menuData.value?.records) return [];

  function buildTree(
    items: Api.SystemManage.AdminMenu[],
    parentId = 0
  ): Array<{ label: string; value: number; children?: ReturnType<typeof buildTree> }> {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        label: item.name,
        value: item.id,
        children: buildTree(items, item.id)
      }));
  }

  return [{ label: '无（顶级菜单）', value: 0 }, ...buildTree(menuData.value.records)];
});
</script>

<template>
  <template v-if="props.type === 'add'">
    <ProTreeSelect
      title="上级菜单"
      path="parent_id"
      :options="parentMenuOptions"
      label-field="label"
      value-field="value"
      children-field="children"
    />
    <ProSelect title="类型" path="type" :options="menuTypeOptions" required />
    <ProInput title="菜单名称" path="name" required />
    <ProInput title="图标" path="icon" />
    <ProSelect title="请求方法" path="method" :options="methodOptions" />
    <ProInput title="路由名称" path="route_name" />
    <ProInput title="路由路径" path="route_path" />
    <ProInput title="组件路径" path="component" />
    <ProInputNumber title="排序" path="sorting" :min="0" />
    <ProSwitch title="状态" path="status" :false-value="0" :true-value="1" />
  </template>
  <template v-else>
    <ProTreeSelect
      title="上级菜单"
      path="parent_id"
      :options="parentMenuOptions"
      label-field="label"
      value-field="value"
      children-field="children"
    />
    <ProSelect title="类型" path="type" :options="menuTypeOptions" required />
    <ProInput title="菜单名称" path="name" required />
    <ProInput title="图标" path="icon" />
    <ProSelect title="请求方法" path="method" :options="methodOptions" />
    <ProInput title="路由名称" path="route_name" />
    <ProInput title="路由路径" path="route_path" />
    <ProInput title="组件路径" path="component" />
    <ProInputNumber title="排序" path="sorting" :min="0" />
    <ProSwitch title="状态" path="status" :false-value="0" :true-value="1" />
  </template>
</template>
