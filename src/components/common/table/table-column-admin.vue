<script setup lang="ts">
import { useRouterPush } from '@/hooks/common/router';

const { routerPushByKey } = useRouterPush();

interface Props {
  user: Api.SystemManage.Admin;
}

const props = withDefaults(defineProps<Props>(), {});

function goRoute() {
  routerPushByKey('manage_admin', { query: { id: props.user.id.toString() } });
}
</script>

<template>
  <NPopover trigger="hover">
    <template #trigger>
      <NTag checkable @click="goRoute">{{ user.real_name ? user.real_name : user.username }}</NTag>
    </template>
    <span>{{ user.id }}</span>
  </NPopover>
</template>
