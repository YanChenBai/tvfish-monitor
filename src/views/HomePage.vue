<template>
  <ion-page style="height: 100vh; overflow: hidden">
    <DndProvider :backend="isMobile() ? TouchBackend : HTML5Backend">
      <NightOverlay />
      <NavPlayer />
      <Layout />
    </DndProvider>
  </ion-page>
</template>

<script setup lang="ts">
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'vue3-dnd';
import NightOverlay from '@/components/nightOverlay.vue';
import NavPlayer from '@/components/Nav/index.vue';
import Layout from '@/components/layout.vue';
import { IonPage } from '@ionic/vue';
import isMobile, { isPhone } from '@/utils/isMobile';
import { autoHideBar } from '@/utils/barStatus';

if (isPhone()) {
  autoHideBar();
}
</script>

<style scoped></style>
