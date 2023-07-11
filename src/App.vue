<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import hideStatusBar from '@/utils/hideStatusBar';

// 自动隐藏状态栏
// hideStatusBar();
</script>
