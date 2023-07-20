<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { usePlayerStore } from '@/stores/playerStore';

// 初始化后台模式
const playerStore = usePlayerStore();
playerStore.switchBackgroundMode(playerStore.config.backgroundMode);
</script>
<style>
body {
  overflow: hidden;
  border-radius: 2px;
  background-color: #121212;
}
</style>
