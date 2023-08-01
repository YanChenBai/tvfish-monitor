<template>
  <MenuWrap ref="menuWrapRef"> </MenuWrap>
</template>

<script setup lang="ts">
import MenuWrap from './menu.vue';
import { ref } from 'vue';

defineOptions({ name: 'MenuIndex' });

const menuWrapRef = ref<InstanceType<typeof MenuWrap>>();
</script>

<style scoped></style>
