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
      <DndProvider :backend="isMobile() ? TouchBackend : HTML5Backend">
        <NightOverlay />
        <NavPlayer />
        <Layout />
      </DndProvider>
    </n-config-provider>
  </ion-page>
</template>

<script setup lang="ts">
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'vue3-dnd';
import NightOverlay from '@/components/nightOverlay.vue';
import NavPlayer from '@/components/nav/index.vue';
import Layout from '@/components/layout.vue';
import { IonPage } from '@ionic/vue';
import isMobile, { isPhone } from '@/utils/isMobile';
import { NConfigProvider, darkTheme } from 'naive-ui';
import { autoHideBar } from '@/utils/barStatus';

autoHideBar();
if (isPhone()) {
  autoHideBar();
}
</script>

<style scoped></style>
