<template>
  <ion-page style="height: 100vh; overflow: hidden">
    <n-config-provider
      abstract
      :theme="darkTheme"
      :theme-overrides="{
        common: {
          primaryColor: '#428cff',
          primaryColorHover: '#5598ff',
          primaryColorPressed: '#3a7be0',
          primaryColorSuppl: '#3a7be0',
        },
        Button: {
          textColorPrimary: '#fff',
          textColorHoverPrimary: '#fff',
          textColorFocusPrimary: '#fff',
          textColorDisabledPrimary: '#fff',
        },
        Slider: {},
      }"
    >
      <div
        class="night-overlay"
        ref="nightOverlayRef"
        @dblclick="closeNightOverlay()"
        :style="{ background: `rgba(0,0,0,${nightOverlayOpacity / 100})` }"
        v-if="showNightOverlay"
      >
        <div v-show="showTips">
          {{ isPhone() ? '长按3S关闭增强黑暗模式' : '双击关闭增强黑暗模式' }}
        </div>
      </div>
      <DndProvider :backend="isMobile() ? TouchBackend : HTML5Backend">
        <NavPlayer></NavPlayer>
        <Layout></Layout>
      </DndProvider>
    </n-config-provider>
  </ion-page>
</template>

<script setup lang="ts">
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'vue3-dnd';
import NavPlayer from '@/components/nav/index.vue';
import Layout from '@/components/layout.vue';
import { IonPage } from '@ionic/vue';
import isMobile, { isPhone } from '@/utils/isMobile';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { NConfigProvider, darkTheme } from 'naive-ui';
import { autoHideBar } from '@/utils/barStatus';
import { onLongPress } from '@vueuse/core';
import { ref, watch } from 'vue';
import { message } from '@/utils/message';

const { showNightOverlay, nightOverlayOpacity } = storeToRefs(usePlayerStore());
const nightOverlayRef = ref(),
  showTips = ref(false);

onLongPress(nightOverlayRef, closeNightOverlay, {
  modifiers: { prevent: true },
  delay: 3000,
});

function closeNightOverlay() {
  showNightOverlay.value = false;
  message('已关闭!');
}

watch(showNightOverlay, (val) => {
  if (val) {
    showTips.value = true;
    setTimeout(() => {
      showTips.value = false;
    }, 5000);
  }
});

autoHideBar();
if (isPhone()) {
  autoHideBar();
}
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
