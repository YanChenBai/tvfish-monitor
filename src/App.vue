<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
console.log(window);
</script>
<style>
body {
  overflow: hidden;
  border-radius: 2px;
  background-color: #121212;
}
</style>
