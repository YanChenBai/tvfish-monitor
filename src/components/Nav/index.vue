<template>
  <div class="nav" v-show="navState">
    <div class="electron-drag"></div>
    <div class="btns">
      <NightOverlayBtn></NightOverlayBtn>
      <Setting></Setting>
      <ion-button
        color="light"
        fill="clear"
        id="layoutModal"
        size="small"
        v-vibration="5"
      >
        <ion-icon :icon="layersOutline"></ion-icon>
      </ion-button>
      <ion-button
        color="light"
        fill="clear"
        @click="menuState = true"
        v-vibration="5"
        size="small"
      >
        <ion-icon :icon="peopleOutline"></ion-icon>
      </ion-button>
      <ion-button
        size="small"
        color="light"
        fill="clear"
        v-vibration="5"
        @click="hideBar()"
        v-if="isPhone()"
      >
        <ion-icon :icon="eyeOffOutline"></ion-icon>
      </ion-button>
      <ion-button
        size="small"
        color="light"
        fill="clear"
        id="settingModal"
        v-vibration="5"
      >
        <ion-icon :icon="settingsOutline"></ion-icon>
      </ion-button>
      <ion-button
        size="small"
        color="light"
        fill="clear"
        v-vibration="5"
        @click="navState = false"
      >
        <ion-icon :icon="close"></ion-icon>
      </ion-button>
    </div>
  </div>

  <LayoutModal />
  <MenuPlayer />
</template>

<script setup lang="ts">
import NightOverlayBtn from './nightOverlayBtn.vue';
import { IonButton, IonIcon } from '@ionic/vue';
import Setting from '@/components/Nav/setting.vue';
import {
  eyeOffOutline,
  peopleOutline,
  layersOutline,
  close,
  settingsOutline,
} from 'ionicons/icons';
import LayoutModal from './preview.vue';
import MenuPlayer from '@/components/Menu/index.vue';
import { hideBar } from '@/utils/barStatus';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { isPhone } from '@/utils/isMobile';

defineOptions({ name: 'PlayerIndex' });
const playerStore = usePlayerStore();
const { navState, menuState } = storeToRefs(playerStore);
</script>

<style scoped>
.nav {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.1s;
  overflow: hidden;
}

.electron-drag {
  width: calc(100% - 250px);
  height: 100%;
  -webkit-app-region: drag;
}
.btns {
  height: 38px;
  display: flex;
  align-items: center;
}
</style>
