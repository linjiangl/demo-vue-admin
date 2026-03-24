<script setup lang="ts">
import { computed } from 'vue';
import { dateToTimestamp } from '@/utils/date';

interface Props {
  date?: any;
  format?: string;
}

const props = withDefaults(defineProps<Props>(), {
  date: null,
  format: 'yyyy-MM-dd HH:mm:ss'
});

const unix = computed(() => {
  if (!props.date) {
    return 0;
  }

  if (typeof props.date === 'number') {
    return props.date;
  }

  return dateToTimestamp(props.date);
});
</script>

<template>
  <NTime v-if="unix" :time="unix" :format="format" time-zone="Asia/Shanghai" />
  <NText v-else>-</NText>
</template>

<style scoped></style>
