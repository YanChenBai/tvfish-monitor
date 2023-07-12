<template>
  <ion-button
    color="light"
    fill="clear"
    id="nightOverlay"
    size="small"
    @click="showNightOverlay = true"
  >
    <ion-icon :icon="moonOutline"></ion-icon>
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import { moonOutline } from 'ionicons/icons';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
defineOptions({ name: 'nightOverlay' });
const { showNightOverlay } = storeToRefs(usePlayerStore());
</script>

<style scoped lang="scss"></style>
