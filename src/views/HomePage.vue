<template>
  <ion-page style="height: 100vh; overflow: hidden">
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
import NavPlayer from '@/components/Nav/index.vue';
import Layout from '@/components/layout.vue';
import LiveDanmuPlayer from '@/components/player/player.vue';
import { getOrgin } from '@/api/getOrgin';
import { IonContent, IonPage } from '@ionic/vue';
import { ConfigType } from '@/hooks/player';
import { onMounted, ref } from 'vue';
import isMobile from '@/utils/isMobile';
const urlDy = ref(''),
  videoRef = ref(),
  typeDy = ref(ConfigType.Flv),
  urlBl = ref(''),
  typeBl = ref(ConfigType.Hls);
onMounted(() => {});
</script>

<style scoped></style>
