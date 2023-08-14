<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>
<style>
body {
  overflow: hidden;
  border-radius: 2px;
  background-color: #121212;
}
.dplayer-controller-mask,
.dplayer-controller,
.dplayer-subtitle,
.dplayer-danmaku,
.dplayer-mask,
.dplayer-bezel {
  display: none !important;
}
</style>
