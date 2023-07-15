<template>
  <div
    class="night-overlay"
    ref="nightOverlayRef"
    @dblclick="closeNightOverlay()"
    @click="showTips()"
    :style="{ background: `rgba(0,0,0,${nightOverlayOpacity / 100})` }"
    v-if="showNightOverlay"
  >
    <div v-show="tipsState">
      {{ isPhone() ? '长按3S关闭增强黑暗模式' : '双击关闭增强黑暗模式' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { isPhone } from '@/utils/isMobile';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { onLongPress } from '@vueuse/core';
import { ref, watch } from 'vue';
import { message } from '@/utils/message';

defineOptions({ name: 'nightOverlay' });

const { showNightOverlay, nightOverlayOpacity } = storeToRefs(usePlayerStore());
const nightOverlayRef = ref(),
  tipsState = ref(false);

onLongPress(nightOverlayRef, closeNightOverlay, {
  modifiers: { prevent: true },
  delay: 3000,
});

function closeNightOverlay() {
  showNightOverlay.value = false;
  message('已关闭!');
}

function showTips() {
  tipsState.value = true;
  setTimeout(() => {
    tipsState.value = false;
  }, 5000);
}
watch(showNightOverlay, (val) => {
  if (val) showTips();
});
</script>

<style scoped>
.night-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(156, 156, 156);
}
</style>
