<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrap" v-show="show">
      <div class="menu-content hide-scrollbar">
        <div
          v-for="item in roomList"
          class="menu-content-item"
          :key="`${item.realId}@${item.platform}`"
        >
          <MenuItem :info="item" @drag="dragItem"></MenuItem>
        </div>
      </div>
      <div class="add">
        <ion-button style="height: 36px" id="menuModal">添加</ion-button>
        <ion-button style="height: 36px" id="outModal">导出 / 导出</ion-button>
      </div>
    </div>
  </Transition>
  <ion-modal ref="menuModal" trigger="menuModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>添加直播间</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="cancel(menuModal)">关闭</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="padding">
        <ion-item>
          <ion-label position="stacked">房间 ID</ion-label>
          <ion-input
            ref="input"
            label=""
            type="text"
            v-model:modelValue="data.roomId"
            placeholder="请输入直播间的 ID"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">房间 ID</ion-label>
          <ion-select
            placeholder="直播平台"
            v-model:modelValue="data.type"
            label=""
          >
            <ion-select-option value="douyu">斗鱼</ion-select-option>
            <ion-select-option value="bili">b站</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button style="margin-top: 20px; width: 100%" @click="add()"
          >添加</ion-button
        >
      </div>
    </ion-content>
  </ion-modal>

  <ion-modal ref="outModal" trigger="outModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>添加直播间</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="cancel(outModal)">关闭</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="padding">
        <ion-item>
          <ion-label position="stacked">JSON</ion-label>
          <ion-input
            ref="input"
            label=""
            type="text"
            v-model:modelValue="jsonData"
            placeholder="输入JSON代码 - 导入会覆盖原数据"
          ></ion-input>
        </ion-item>
        <ion-button style="margin-top: 10px; width: 100%" @click="input"
          >导入</ion-button
        >
        <ion-button style="margin-top: 10px; width: 100%" @click="out"
          >导出</ion-button
        >
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
import { reactive, ref } from 'vue';
import MenuItem from './item.vue';
import { onClickOutside, useVModel } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { usePlayerStore, Platform } from '@/stores/playerStore';
import { getRoomInfo } from '@/api/getOrgin';
import { Clipboard } from '@capacitor/clipboard';
import '@/theme/hideScrollbar.css';
import { toastController } from '@ionic/vue';

defineOptions({ name: 'MenuList' });

const { roomList } = storeToRefs(usePlayerStore());
const props = withDefaults(
  defineProps<{
    show: boolean;
  }>(),
  {
    show: false,
  },
);
const data = reactive({
  roomId: undefined,
  type: Platform.Bili,
});
const emit = defineEmits(['update:show']);
const show = useVModel(props, 'show', emit);
const menuModal = ref(),
  menuWrap = ref(),
  outModal = ref(),
  jsonData = ref('');

function cancel(vn: any) {
  vn.$el.dismiss(null, 'cancel');
}

async function add() {
  if (data.roomId === undefined) return;
  const type = data.type;
  const roomId = data.roomId;

  let flag = false;
  for (const item of roomList.value) {
    if (item.platform === type && roomId === item.roomId) {
      console.log(item);

      flag = true;
    }
  }

  if (flag) {
    return;
  }
  try {
    const res = await getRoomInfo(roomId, type);
    if (res === false) {
      return;
    }

    res.keyframe =
      type === Platform.Bili
        ? 'https://images.weserv.nl/?url=' + res.keyframe
        : res.keyframe;

    res.face =
      type === Platform.Bili
        ? 'https://images.weserv.nl/?url=' + res.face
        : res.face;

    roomList.value.push({
      roomId: roomId,
      realId: res.room_id,
      platform: type,
      name: res.name,
      face: res.face,
      title: res.title,
      news: res.news,
      keyframe: res.keyframe,
      status: res.live_status,
    });

    const toast = await toastController.create({
      message: '成功!',
      duration: 1000,
      position: 'top',
    });
    await toast.present();
  } catch (error) {
    console.log(error);
  }
}

function dragItem() {
  show.value = false;
}

function input() {
  try {
    const tmp = JSON.parse(jsonData.value);
    roomList.value = tmp;
  } catch (error) {
    console.log(error);
  }
}

async function out() {
  await Clipboard.write({
    string: JSON.stringify(roomList.value),
  });
  const toast = await toastController.create({
    message: '复制成功!',
    duration: 1000,
    position: 'top',
  });
  await toast.present();
}

onClickOutside(menuWrap, () => (show.value = false), {
  ignore: [menuModal],
});
</script>

<style scoped>
@import '@/theme/hideScrollbar.css';
.menu-wrap {
  width: 300px;
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(20, 20, 20, 0.9);
  z-index: 9999;
  padding: 10px;
}
.menu-content {
  height: calc(100vh - 66px);
  width: 100%;
  overflow-y: scroll;
}
.menu-content-item:not(:first-child) {
  margin-top: 10px;
}
.add {
  height: 60px;
  margin-top: 10px;
  display: flex;
}

.padding {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.menu-enter-active,
.menu-leave-active {
  transition: transform 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  transform: translateX(100%);
}
</style>
