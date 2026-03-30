<script setup lang="ts">
import { computed } from 'vue';
import { useRouterPush } from '@/hooks/common/router';

const { routerPushByKey } = useRouterPush();

interface Props {
  userId: number;
  user?: Api.User.User | null;
  link?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  link: false,
});

const displayNickname = computed(() => {
  const nickname = props.user?.nickname?.trim() || '';

  if (!nickname) {
    return '-';
  }

  const chars = Array.from(nickname);

  if (chars.length <= 5) {
    return nickname;
  }

  return `${chars.slice(0, 5).join('')}...`;
});

const popoverText = computed(() => {
  const nickname = props.user?.nickname?.trim() || '';

  return nickname ? `${props.userId} ${nickname}` : String(props.userId);
});

function goRoute() {
  if (props.link) {
    routerPushByKey('user_index', { query: { id: props.userId.toString() } });
  }
}
</script>

<template>
  <NPopover v-if="user" trigger="hover">
    <template #trigger>
      <NTag checkable @click="goRoute">{{ userId }} {{ displayNickname }}</NTag>
    </template>
    <span>{{ popoverText }}</span>
  </NPopover>
  <NText v-else>{{ userId > 0 ? userId : '-' }}</NText>
</template>
