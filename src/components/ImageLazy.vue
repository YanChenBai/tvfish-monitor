<template>
  <img ref="imageRef" :src="src" />
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { onMounted, ref } from 'vue';
defineOptions({ name: 'ImageLazy' });
const imageRef = ref();
const src = ref('');
const props = defineProps<{ url: string }>();
onMounted(() => {
  const { stop } = useIntersectionObserver(imageRef, ([{ isIntersecting }]) => {
    console.log(isIntersecting);

    if (isIntersecting) {
      stop();
      const img = new Image();
      img.src = props.url;
      img.onload = () => {
        src.value = img.src;
        console.log(img.src);
      };
    }
  });
});
</script>

<style scoped></style>
