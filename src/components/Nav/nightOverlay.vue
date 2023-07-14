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
import { watch } from 'vue';
defineOptions({ name: 'nightOverlay' });
const { showNightOverlay, navState } = storeToRefs(usePlayerStore());

// 打开遮罩时关闭导航
watch(showNightOverlay, (val: boolean) => {
  if (val === true) navState.value = false;
});
</script>

<style scoped lang="scss"></style>
