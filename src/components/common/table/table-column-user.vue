<script setup lang="ts">
import { useRouterPush } from '@/hooks/common/router';

const { routerPushByKey } = useRouterPush();

interface Props {
  userId: number;
  user?: Api.User.User | null;
}

const props = withDefaults(defineProps<Props>(), {
  user: null
});

function goRoute() {
  routerPushByKey('user_index', { query: { id: props.userId.toString() } });
}
</script>

<template>
  <NPopover v-if="user" trigger="hover">
    <template #trigger>
      <NTag checkable @click="goRoute">{{ user.nickname }}</NTag>
    </template>
    <span>{{ userId }}</span>
  </NPopover>
  <NText v-else>{{ userId > 0 ? userId : '-' }}</NText>
</template>
