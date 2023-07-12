<template>
  <ion-page style="height: 100vh; overflow: hidden">
    <div
      class="night-overlay"
      v-if="showNightOverlay"
      @click="showNightOverlay = false"
    ></div>
    <DndProvider :backend="isMobile() ? TouchBackend : HTML5Backend">
      <NavPlayer></NavPlayer>
      <Layout></Layout>
    </DndProvider>
  </ion-page>
</template>

<script setup lang="ts">
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'vue3-dnd';
import NavPlayer from '@/components/nav/index.vue';
import Layout from '@/components/layout.vue';
import { IonPage } from '@ionic/vue';
import isMobile from '@/utils/isMobile';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
const { showNightOverlay } = storeToRefs(usePlayerStore());
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
