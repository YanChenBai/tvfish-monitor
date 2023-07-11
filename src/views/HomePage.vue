<template>
  <ion-page style="height: 100vh; overflow: hidden">
    <DndProvider :backend="isMobile() ? TouchBackend : HTML5Backend">
      <!-- <ion-content :fullscreen="true"> -->
      <NavPlayer></NavPlayer>
      <!-- <div style="display: flex; flex-wrap: wrap">
          <div style="width: 100%; height: 50vh">
            <LiveDanmuPlayer title="王拉奇" :type="typeDy" :url="urlDy" />
          </div>
          <div style="width: 100%; height: 50vh">
            <LiveDanmuPlayer title="菠萝塞东" :type="typeBl" :url="urlBl" />
          </div>
        </div> -->
      <Layout></Layout>
      <!-- </ion-content> -->
    </DndProvider>
  </ion-page>
</template>

<script setup lang="ts">
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DndProvider } from 'vue3-dnd';
import NavPlayer from '@/components/Nav/index.vue';
import Layout from '@/components/Layout/index.vue';
import LiveDanmuPlayer from '@/components/LiveDanmuPlayer/index.vue';
import { getOrgin } from '@/api/getOrgin';
import { IonContent, IonPage } from '@ionic/vue';
import { ConfigType } from '@/components/LiveDanmuPlayer/type';
import { onMounted, ref } from 'vue';
const urlDy = ref(''),
  videoRef = ref(),
  typeDy = ref(ConfigType.Flv),
  urlBl = ref(''),
  typeBl = ref(ConfigType.Hls);

function isMobile() {
  let flag = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
  );
  return flag;
}

onMounted(() => {});
</script>

<style scoped></style>
