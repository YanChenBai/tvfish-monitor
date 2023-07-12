<template>
  <div class="nav" v-show="navState">
    <div class="electron-drag"></div>
    <div>
      <ion-button color="light" fill="clear" id="layoutModal" size="small">
        <ion-icon :icon="layersOutline"></ion-icon>
      </ion-button>
      <ion-button
        color="light"
        fill="clear"
        @click="showMenu = true"
        size="small"
      >
        <ion-icon :icon="peopleOutline"></ion-icon>
      </ion-button>
      <ion-button size="small" color="light" fill="clear" @click="hideBar()">
        <ion-icon :icon="eyeOffOutline"></ion-icon>
      </ion-button>
      <ion-button
        size="small"
        color="light"
        fill="clear"
        @click="navState = false"
      >
        <ion-icon :icon="close"></ion-icon>
      </ion-button>
    </div>
  </div>
  <LayoutModal />
  <MenuPlayer v-model:show="showMenu" />
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import {
  eyeOffOutline,
  peopleOutline,
  layersOutline,
  close,
} from 'ionicons/icons';
import LayoutModal from './preview.vue';
import MenuPlayer from '@/components/menu/index.vue';
import { ref } from 'vue';
import { hideBar } from '@/utils/barStatus';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
defineOptions({ name: 'index' });
const { navState } = storeToRefs(usePlayerStore());
const showMenu = ref(false);
</script>

<style scoped>
.nav {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.electron-drag {
  width: calc(100% - 200px);
  height: 100%;
  transition: all 0.3s;
  -webkit-app-region: drag;
}
.electron-drag:hover {
  /* background: rgba(134, 134, 134, 0.1); */
}
</style>
