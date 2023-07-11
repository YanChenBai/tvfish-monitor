<template>
  <div class="nav">
    <ion-button
      color="light"
      id="layoutModal"
      fill="clear"
      style="height: 30px; width: 100px"
      >布局</ion-button
    >
    <ion-button
      color="light"
      fill="clear"
      style="height: 30px; width: 100px"
      @click="showMenu = true"
      >UP</ion-button
    >
  </div>
  <LayoutModal></LayoutModal>
  <MenuPlayer v-model:show="showMenu" />
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import LayoutModal from './preview.vue';
import MenuPlayer from '@/components/Menu/index.vue';
import { ref } from 'vue';
defineOptions({ name: 'index' });

const showMenu = ref(false);
</script>

<style scoped>
.nav {
  height: 38px;
}
</style>
