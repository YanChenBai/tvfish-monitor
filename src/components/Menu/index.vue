<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrap" v-show="show">
      <div class="menu-content">
        <div v-for="item in roomList" class="menu-content-item">
          <MenuItem :info="item"></MenuItem>
        </div>
      </div>
      <div class="add">
        <ion-button style="width: 100%; height: 60px" id="menuModal"
          >添加</ion-button
        >
      </div>
    </div>
  </Transition>
  <ion-modal ref="menuModal" trigger="menuModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>添加直播间</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="cancel()">关闭</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="padding">
        <ion-item>
          <ion-label position="stacked">房间 ID</ion-label>
          <ion-input
            ref="input"
            type="text"
            placeholder="请输入直播间的 ID"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">房间 ID</ion-label>
          <ion-select placeholder="直播平台">
            <ion-select-option value="douyu">斗鱼</ion-select-option>
            <ion-select-option value="bili">b站</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button style="margin-top: 20px; width: 100%">添加</ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonModal,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonContent,
  IonTitle,
  IonInput,
  IonItem,
} from '@ionic/vue';
import { ref } from 'vue';
import MenuItem from './item.vue';
import { onClickOutside, useVModel } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { usePlayerStore, type RoomListItem } from '@/stores/playerStore';
defineOptions({ name: 'Menu' });

const { layoutIndex, roomList } = storeToRefs(usePlayerStore());
const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false,
  },
);
const emit = defineEmits(['update:show']);
const show = useVModel(props, 'show', emit);
const menuModal = ref(),
  menuWrap = ref();

function cancel() {
  menuModal.value.$el.dismiss(null, 'cancel');
}

onClickOutside(menuWrap, () => (show.value = false), {
  ignore: [menuModal],
});
</script>

<style scoped>
.menu-wrap {
  width: 220px;
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  padding: 10px;
}
.menu-content {
  height: calc(100vh - 90px);
  width: 100%;
  overflow-y: scroll;
}
.menu-content-item:not(:first-child) {
  margin-top: 10px;
}
.add {
  height: 60px;
  margin-top: 10px;
}

/* 隐藏 Chrome、Safari 和 Opera 的滚动条 */
.menu-content::-webkit-scrollbar {
  display: none;
}

/* 隐藏 IE、Edge 和 Firefox 的滚动条 */
.menu-content {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.padding {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}
</style>
