<template>
  <ion-button
    color="light"
    fill="clear"
    id="nightOverlay"
    size="small"
    @click="showNightOverlay = true"
    v-vibration="5"
  >
    <ion-icon :icon="moonOutline"></ion-icon>
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import { moonOutline } from 'ionicons/icons';
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
defineOptions({ name: 'nightOverlayBtn' });
const { showNightOverlay, navState } = storeToRefs(useConfigStore());

// 打开遮罩时关闭导航
watch(showNightOverlay, (val: boolean) => {
  if (val === true) navState.value = false;
});
</script>

<style scoped></style>
@/stores/config
