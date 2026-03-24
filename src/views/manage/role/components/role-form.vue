<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchAdminMenuList } from '@/service/api';

export interface Props {
  type?: 'add' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'add'
});

// Fetch menu list for permissions
const menuData = ref<Api.SystemManage.AdminMenuList | null>(null);

onMounted(async () => {
  const { data } = await fetchAdminMenuList({ current: 1, size: 1000 });
  menuData.value = data;
});

const menuOptions = computed(() => {
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

  return buildTree(menuData.value.records);
});
</script>

<template>
  <template v-if="props.type === 'add'">
    <ProInput title="角色名称" path="name" required />
    <ProInput title="角色标识" path="identifier" required />
    <ProSelect
      title="权限"
      path="permissions"
      :options="menuOptions"
      multiple
      label-field="label"
      value-field="value"
      children-field="children"
      required
    />
    <ProSwitch title="超级角色" path="is_super" :false-value="0" :true-value="1" />
    <ProSwitch title="系统角色" path="is_system" :false-value="0" :true-value="1" />
    <ProSwitch title="状态" path="status" :false-value="0" :true-value="1" />
  </template>
  <template v-else>
    <ProInput title="角色名称" path="name" required />
    <ProInput title="角色标识" path="identifier" required />
    <ProSelect
      title="权限"
      path="permissions"
      :options="menuOptions"
      multiple
      label-field="label"
      value-field="value"
      children-field="children"
      required
    />
    <ProSwitch title="超级角色" path="is_super" :false-value="0" :true-value="1" />
    <ProSwitch title="系统角色" path="is_system" :false-value="0" :true-value="1" />
    <ProSwitch title="状态" path="status" :false-value="0" :true-value="1" />
  </template>
</template>
