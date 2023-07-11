<template>
  <div class="player-popover-wrap" ref="popoverRef">
    <div @click="showPopover()" @touchstart="showPopover()">
      <slot name="target"></slot>
    </div>

    <Transition name="popover">
      <div class="player-popover" v-show="show">
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref } from 'vue';

defineOptions({ name: 'PlayerPopover' });

const props = withDefaults(defineProps<{ width?: string }>(), {
  width: '100px',
});
const width = props.width;
const show = ref(false);
const popoverRef = ref();

// 关闭弹出窗口
onClickOutside(popoverRef, (event) => {
  closePopover();
});

function showPopover() {
  show.value = true;
}

function closePopover() {
  show.value = false;
}
</script>

<style scoped>
.player-popover-wrap {
  display: inline-block;
  position: relative;
}
.player-popover {
  width: v-bind(width);
  color: #fff;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  position: absolute;
  overflow: hidden;
  top: 0;
  right: 0;
  transform: translateY(calc(-100% - 4px));
}

.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.2s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
}
</style>
