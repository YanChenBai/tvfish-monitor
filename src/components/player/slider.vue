<template>
  <PlayerPopover width="50px">
    <template #target>
      <slot name="target"></slot>
    </template>
    <div class="wrap">
      <vue-slider
        @change="change"
        v-model="volume"
        direction="btt"
        :height="200"
        tooltip="none"
      ></vue-slider>
    </div>
  </PlayerPopover>
</template>

<script setup lang="ts">
import '@/theme/slider.css';
import VueSlider from 'vue-slider-component';
import PlayerPopover from './popover.vue';
import { useVModel } from '@vueuse/core';

defineOptions({ name: 'PlayerSlider' });

const props = withDefaults(
  defineProps<{
    volume: number;
  }>(),
  { volume: 0 },
);
const emit = defineEmits(['update:volume', 'change']);
const volume = useVModel(props, 'volume', emit);

const change = (val: number) => emit('change', val);
</script>

<style scoped>
.target {
  display: inline-flex;
  align-items: center;
}
.wrap {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
