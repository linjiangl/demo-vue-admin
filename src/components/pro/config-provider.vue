<script setup lang="tsx">
import { computed } from 'vue';
import { zhCN } from 'pro-naive-ui';
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();

const locale = computed(() => {
  return appStore.locale === 'zh-CN' ? zhCN : undefined;
});

const propOverrides = {
  ProSearchForm: {
    cols: '1 s:2 l:12',
    labelPlacement: 'left'
  },
  ProCard: {
    showCollapse: false
  },
  ProDrawerForm: {
    closeOnEsc: true,
    maskClosable: true,
    autoFocus: false,
    width: appStore.isMobile ? '100%' : 720,
    labelWidth: 120,
    labelPlacement: 'left',
    labelAlign: 'right'
  },
  ProModalForm: {
    closeOnEsc: true,
    maskClosable: true
  },
  ProDataTable: {
    size: 'small',
    flexHeight: false,
    minHeight: 420,
    pagination: {
      pageSlot: appStore.isMobile ? 6 : undefined,
      showSizePicker: true,
      pageSizes: [10, 20, 50, 100],
      prefix: ({ itemCount }: { itemCount: number }) => `共 ${itemCount} 条`
    }
  }
};
</script>

<template>
  <ProConfigProvider :locale="locale" :prop-overrides="propOverrides" class="h-full">
    <slot></slot>
  </ProConfigProvider>
</template>
