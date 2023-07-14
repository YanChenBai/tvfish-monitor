<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrap" v-show="show">
      <div>
        <ion-input
          style="min-height: 26px; margin-bottom: 10px; color: #ffff"
          color="primary"
          placeholder="搜索主播"
          v-model:modelValue="searchKeyWorld"
        ></ion-input>
      </div>
      <div class="menu-content hide-scrollbar" ref="menuContentRef">
        <div
          v-for="item in searchByName"
          class="menu-content-item"
          :key="`${item.realId}@${item.platform}`"
        >
          <MenuItem :info="item" @drag="dragItem"></MenuItem>
        </div>
      </div>
      <div class="add">
        <ion-button id="menuModal">
          <ion-icon :icon="personAddOutline"></ion-icon>
        </ion-button>
        <ion-button id="outModal">
          <ion-icon :icon="planetOutline"></ion-icon>
        </ion-button>
        <ion-button id="updateAll" @click="updateAll" :disabled="updateLoading">
          <ion-icon :icon="refresh" v-if="!updateLoading"></ion-icon>
          <div v-else style="display: flex; align-items: center">
            <ion-spinner name="bubbles"></ion-spinner>
            {{ updateIndex + 1 }} / {{ roomList.length }}
          </div>
        </ion-button>
        <ion-button id="updateAll" @click="sortList">
          <ion-icon :icon="swapVerticalOutline"></ion-icon>
        </ion-button>
        <ion-button id="updateAll" @click="goTop">
          <ion-icon :icon="arrowUpOutline"></ion-icon>
        </ion-button>
      </div>
    </div>
  </Transition>
  <ion-modal ref="menuModal" trigger="menuModal">
    <ion-header>
      <ion-toolbar>
        <ion-title class="modal-title">添加直播间</ion-title>
        <ion-buttons slot="end" class="modal-close">
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
        <ion-title class="modal-title">导入 / 出直播间</ion-title>
        <ion-buttons slot="end" class="modal-close">
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
        <ion-button style="margin-top: 10px; width: 100%" @click="inputData"
          >导入</ion-button
        >
        <ion-button style="margin-top: 10px; width: 100%" @click="outData"
          >导出</ion-button
        >
        <ion-button style="margin-top: 10px; width: 100%" @click="inputDefData"
          >导入默认数据</ion-button
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
  IonIcon,
  IonSpinner,
} from '@ionic/vue';

import { computed, reactive, ref } from 'vue';
import {
  personAddOutline,
  swapVerticalOutline,
  arrowUpOutline,
  refresh,
  planetOutline,
} from 'ionicons/icons';
import MenuItem from './item.vue';
import { onClickOutside, useVModel } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { usePlayerStore, Platform } from '@/stores/playerStore';
import { getRoomInfo } from '@/api/getOrgin';
import { Clipboard } from '@capacitor/clipboard';
import '@/theme/hideScrollbar.css';
import { message } from '@/utils/message';
import { IMAGE_PROXY } from '@/config/proxy';
import defRoomList from '@/config/roomList';
import { isPhone } from '@/utils/isMobile';
import { useBackButton } from '@ionic/vue';

defineOptions({ name: 'MenuList' });

const playerStore = usePlayerStore();
const { roomList } = storeToRefs(playerStore);
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
  jsonData = ref(''),
  updateLoading = ref(false),
  updateIndex = ref(0),
  searchKeyWorld = ref(''),
  menuContentRef = ref();

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
      type === Platform.Bili ? IMAGE_PROXY + res.keyframe : res.keyframe;

    res.face = type === Platform.Bili ? IMAGE_PROXY + res.face : res.face;

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

    await message('添加成功!');
    sortList();
  } catch (error) {
    console.log(error);
  }
}

function dragItem() {
  show.value = false;
}

function inputData() {
  try {
    const tmp = JSON.parse(jsonData.value);
    roomList.value = tmp;
  } catch (error) {
    console.log(error);
  }
}

async function outData() {
  await Clipboard.write({
    string: JSON.stringify(roomList.value),
  });
  await message('复制成功!');
}

async function updateAll() {
  updateLoading.value = true;
  updateIndex.value = 0;
  for (let index = 0; index < roomList.value.length; index++) {
    try {
      await playerStore.updateRoomInfo(
        roomList.value[index].realId,
        roomList.value[index].platform,
        false,
      );
      updateIndex.value = index;
    } catch (error) {
      updateIndex.value = index;
    }
  }
  await message('更新完成!');
  sortList();
  updateLoading.value = false;
}

function checkStatus(status: number) {
  if (status === 1) return 1;
  else return 0;
}

function sortList() {
  roomList.value = roomList.value.sort((a, b) => {
    return checkStatus(Number(b.status)) - checkStatus(Number(a.status));
  });
}

function goTop() {
  menuContentRef.value.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

async function inputDefData() {
  roomList.value = defRoomList;
  await message('添加完成!');
}

const searchByName = computed(() => {
  return roomList.value.filter(
    (item) => item.name.search(searchKeyWorld.value) !== -1,
  );
});

onClickOutside(menuWrap, () => (show.value = false), {
  ignore: [menuModal, menuWrap, outModal],
});

if (isPhone()) {
  // 监听系统返回
  useBackButton(10, () => {
    show.value = false;
  });
}
</script>

<style scoped>
@import '@/theme/hideScrollbar.css';
.menu-wrap {
  width: 300px;
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(20, 20, 20, 1);
  z-index: 9999;
  padding: 10px;
}
.menu-content {
  height: calc(100vh - 66px - 36px);
  box-sizing: border-box;
  width: calc(100%);
  overflow-y: scroll;
}
.menu-content-item:not(:first-child) {
  margin-top: 20px;
}
.add {
  height: 60px;
  display: flex;
  padding-top: 6px;
  box-sizing: border-box;
  justify-content: left;
  align-items: top;
  justify-content: space-between;
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

.remove {
  position: absolute;
  background-color: #ff4961;
  box-sizing: border-box;
  border-radius: 30px;
  border: 2px solid #fca5b0;
  width: 60px;
  height: 60px;
  z-index: 99999;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26px;
  color: #fff;
}
</style>
