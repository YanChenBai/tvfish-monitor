<template>
  <n-popover trigger="click" :to="false" :show-arrow="false">
    <template #trigger>
      <slot name="target"></slot>
    </template>
    <slot></slot>
  </n-popover>
</template>

<script setup lang="ts">
import { NPopover } from 'naive-ui';
defineOptions({ name: 'PlayerPopover' });
</script>

<style scoped></style>
