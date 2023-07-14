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
      }"
    >
      <div
        class="night-overlay"
        v-if="showNightOverlay"
        @click="showNightOverlay = false"
      ></div>
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

const { showNightOverlay } = storeToRefs(usePlayerStore());

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
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
