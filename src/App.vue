<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar } from '@capacitor/status-bar';
const hideStatusBar = async () => {
  setInterval(async () => {
    await StatusBar.hide();
    StatusBar.setOverlaysWebView({ overlay: true });
  }, 5000);
};
hideStatusBar();
</script>
<style>
.scroll-y {
}
</style>
