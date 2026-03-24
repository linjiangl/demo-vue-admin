<script setup lang="ts">
import { ImageOutline as ImageOutlineIcon } from '@vicons/ionicons5';

interface Props {
  src: string;
  preview?: string;
  width?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 64,
  preview: ''
});
</script>

<template>
  <NImage :width="props.width" :src="src" :preview-src="preview ? preview : src" lazy>
    <template #error>
      <NIcon :size="100" color="lightGrey">
        <ImageOutlineIcon />
      </NIcon>
    </template>
  </NImage>
</template>

<style scoped></style>
