<script setup lang="ts">
interface Props {
  src?: string | null;
  size?: 'small' | 'medium' | 'large' | number;
  fallback?: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  size: 'small',
  fallback: 'U'
});
</script>

<template>
  <NAvatar v-if="props.src" :size="props.size" :src="props.src" />
  <NAvatar v-else :size="props.size">{{ props.fallback }}</NAvatar>
</template>

<style scoped></style>
