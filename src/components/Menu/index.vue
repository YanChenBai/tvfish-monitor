<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrap" v-show="show">
      <div class="menu-content hide-scrollbar">
        <div v-for="item in roomList" class="menu-content-item">
          <MenuItem :info="item"></MenuItem>
        </div>
      </div>
      <div class="add">
        <ion-button style="height: 60px" id="menuModal">添加</ion-button>
        <ion-button style="height: 60px" id="outModal">导出 / 导出</ion-button>
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
          <ion-label position="stacked">房间 ID</ion-label>
          <ion-input
            ref="input"
            label=""
            type="text"
            v-model:modelValue="data.roomId"
            placeholder="请输入直播间的 ID"
          ></ion-input>
        </ion-item>
        <ion-button style="margin-top: 10px; width: 100%">导入</ion-button>
        <ion-button style="margin-top: 10px; width: 100%">导出</ion-button>
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
import {
  usePlayerStore,
  type RoomListItem,
  Platform,
} from '@/stores/playerStore';
import { getRoomInfo } from '@/api/getOrgin';
import '@/theme/hideScrollbar.css';
import { useClipboard } from '@vueuse/core';

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
const data = reactive({
  roomId: undefined,
  type: Platform.Bili,
});
const emit = defineEmits(['update:show']);
const show = useVModel(props, 'show', emit);
const menuModal = ref(),
  menuWrap = ref(),
  outModal = ref(),
  code = ref('');

function cancel(vn: any) {
  vn.$el.dismiss(null, 'cancel');
}

async function add() {
  const type = data.type;
  const roomId = data.roomId!;

  let flag = false;
  for (let item of roomList.value) {
    if (item.platform === type && roomId === item.roomId) {
      console.log(item);

      flag = true;
    }
  }
  console.log(flag);

  if (flag) {
    return;
  }
  try {
    let res = await getRoomInfo(roomId, type);
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
    });
  } catch (error) {
    console.log(error);
  }
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
  display: flex;
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
