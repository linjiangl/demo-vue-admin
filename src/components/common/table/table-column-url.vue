<script setup lang="ts">
import { openWebUrl } from '@/utils/common';

interface Props {
  title: string;
  url: string;
}

const props = defineProps<Props>();

function goRoute() {
  if (!props.url) {
    return;
  }
  openWebUrl(props.url);
}
</script>

<template>
  <NButton a text @click="goRoute">{{ title }}</NButton>
</template>
