<template>
  <div class="btns">
    <ion-button v-vibration="5">
      {{ count }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
defineOptions({ name: 'MenuBtns' });
defineProps<{
  count: number;
}>();
</script>

<style scoped>
.btns {
  height: 60px;
  display: flex;
  padding-top: 6px;
  box-sizing: border-box;
  justify-content: left;
  align-items: top;
}
</style>
