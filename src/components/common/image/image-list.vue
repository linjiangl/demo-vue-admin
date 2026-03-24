<script setup lang="ts">
import { ImageOutline as ImageOutlineIcon } from '@vicons/ionicons5';

interface Props {
  src: string[];
  width?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 64
});
</script>

<template>
  <NImageGroup>
    <NSpace>
      <NImage v-for="(item, index) in props.src" :key="index" :width="props.width" :src="item" lazy>
        <template #error>
          <NIcon :size="100" color="lightGrey">
            <ImageOutlineIcon />
          </NIcon>
        </template>
      </NImage>
    </NSpace>
  </NImageGroup>
</template>

<style scoped></style>
