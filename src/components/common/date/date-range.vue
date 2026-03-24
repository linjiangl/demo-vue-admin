<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { dateToTimestamp, formatDate, getDateSubtractTimestamp } from '@/utils/date';

interface Props {
  value?: string[] | null;
  days?: number;
  today?: boolean;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  days: 7,
  today: true,
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期'
});

const emit = defineEmits<{
  (e: 'update:value', value: string[]): void;
  (e: 'change'): void;
}>();

const range = ref<[number, number] | null>(null);

const toRange = (value: [number, number] | null) => (value ? [formatDate(value[0]), formatDate(value[1])] : []);

function onConfirm(value: [number, number]) {
  emit('update:value', toRange(value));
  emit('change');
}

function onClear() {
  emit('update:value', []);
}

onMounted(() => {
  if (props.value?.length === 2) {
    // 优先处理直接赋值
    range.value = [dateToTimestamp(props.value[0]), dateToTimestamp(props.value[1])];
  } else if (props.days >= 0) {
    // 其次处理按天数计算
    range.value = [
      getDateSubtractTimestamp(props.today ? props.days : props.days + 1),
      getDateSubtractTimestamp(props.today ? 0 : 1)
    ];
  }

  if (range.value) {
    emit('update:value', toRange(range.value));
  }
});
</script>

<template>
  <NDatePicker
    v-model:value="range"
    class="w-320px"
    type="daterange"
    value-format="yyyy-MM-dd"
    clearable
    :start-placeholder="props.startPlaceholder"
    :end-placeholder="props.endPlaceholder"
    :on-confirm="onConfirm"
    :on-clear="onClear"
  />
</template>
