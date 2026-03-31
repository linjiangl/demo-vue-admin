<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface';
import { updateUser } from '@/service/api';

interface Props {
  user: Api.User.User;
}

interface Emits {
  (e: 'reload'): void;
}

const message = useMessage();
const dialog = useDialog();

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const options = ref<DropdownMixedOption[]>(initOptions(props.user.status));

function handleSelect(key: string) {
  // eslint-disable-next-line default-case
  switch (key) {
    case 'status_disabled':
      updateStatus(0);
      break;
    case 'status_enabled':
      updateStatus(1);
      break;
  }
}

function updateStatus(status: number) {
  dialog.warning({
    title: '提示',
    content: '您确定要执行该操作吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      updateUser(props.user.id, { status })
        .then(() => {
          message.success('修改成功');

          options.value = [];
          nextTick(() => {
            options.value = initOptions(status);
          });

          emit('reload');
        })
        .catch(() => {});
    }
  });
}

function initOptions(status: number) {
  const optionList: DropdownMixedOption[] = [];

  if (status === 1) {
    optionList.push({
      label: '禁用',
      key: 'status_disabled'
    });
  } else if (status === 0) {
    optionList.push({
      label: '启用',
      key: 'status_enabled'
    });
  }

  return optionList;
}
</script>

<template>
  <NDropdown trigger="click" :options="options" @select="handleSelect">
    <NButton type="primary">
      更多操作
      <SvgIcon icon="mingcute:down-fill" class="ml-5px" />
    </NButton>
  </NDropdown>
</template>

<style scoped></style>
