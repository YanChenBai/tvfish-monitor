<template>
  <div class="nav" v-show="navState">
    <div class="electron-drag"></div>
    <div>
      <NightOverlay></NightOverlay>
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
      <ion-button
        size="small"
        color="light"
        fill="clear"
        @click="hideBar()"
        v-if="isPhone()"
      >
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
import NightOverlay from './nightOverlay.vue';
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
import { isPhone } from '@/utils/isMobile';

defineOptions({ name: 'PlayerIndex' });
const playerStore = usePlayerStore();
const { navState } = storeToRefs(playerStore);
const showMenu = ref(false);
</script>

<style scoped>
.nav {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.1s;
}

.electron-drag {
  width: calc(100% - 250px);
  height: 100%;
  -webkit-app-region: drag;
}
</style>
