<template>
  <div class="nav" v-show="navState">
    <div class="electron-drag">
      <template v-if="isElecreon()">右键关闭</template>
    </div>
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
      <List />
      <!-- <ion-button
        size="small"
        color="light"
        fill="clear"
        v-vibration="5"
        @click="hideBar()"
        v-if="isPhone()"
      >
        <ion-icon :icon="eyeOffOutline"></ion-icon>
      </ion-button> -->
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
        <ion-icon :icon="chevronUpOutline"></ion-icon>
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
import List from '@/components/Nav/list.vue';
import {
  eyeOffOutline,
  peopleOutline,
  layersOutline,
  close,
  settingsOutline,
  chevronUpOutline,
} from 'ionicons/icons';
import LayoutModal from './preview.vue';
import MenuPlayer from '@/components/Menu/menu.vue';
import { hideBar } from '@/utils/barStatus';
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { isElecreon, isPhone } from '@/utils/isMobile';
import { watch } from 'vue';
import { useEventListener } from '@vueuse/core';

defineOptions({ name: 'PlayerIndex' });
const playerStore = useConfigStore();
const { navState, menuState, config } = storeToRefs(playerStore);

// 自动关闭导航
let timer: number | null = null;
function autoCloseNav() {
  if (!config.value.autoCloseNav) return;
  if (navState.value === true) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer !== null ? clearTimeout(timer) : '';
      navState.value = false;
    }, 10000);
  } else {
    timer !== null ? clearTimeout(timer) : '';
  }
}

watch(navState, () => (config.value.autoCloseNav ? autoCloseNav() : ''), {
  immediate: true,
});

// 监听是否开启，开启执行自动关闭
watch(
  () => config.value.autoCloseNav,
  (val) => {
    if (val === false) {
      timer !== null ? clearTimeout(timer) : '';
    } else {
      autoCloseNav();
    }
  },
);

// 失去焦点关闭
useEventListener(window, 'blur', () => {
  if (config.value.leaveWinCloseNav) navState.value = false;
});
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
  font-size: 14px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: rgba(255, 255, 255, 0.4);
  -webkit-app-region: drag;
}
.btns {
  height: 38px;
  display: flex;
  align-items: center;
}
</style>
@/stores/config
