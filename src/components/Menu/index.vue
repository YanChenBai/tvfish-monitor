<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrap" v-show="menuState">
      <div>
        <ion-input
          style="min-height: 26px; margin-bottom: 10px; color: #ffff"
          color="primary"
          placeholder="搜索主播"
          :clear-input="true"
          v-model:modelValue="searchKeyWorld"
        ></ion-input>
      </div>
      <div class="menu-content hide-scrollbar" ref="menuContentRef">
        <div v-for="item in searchByName" class="menu-content-item">
          <MenuItem
            :key="`${item.platform}@${item.roomId}`"
            :disabled="updateLoading"
            :info="item"
            @drag="dragItem"
            @setting="setOpen(item)"
          ></MenuItem>
        </div>
      </div>
      <div class="add">
        <ion-button v-vibration="5">
          {{ searchByName.length }}
        </ion-button>
        <ion-button id="menuModal" :disabled="updateLoading" v-vibration="5">
          <ion-icon :icon="personAddOutline"></ion-icon>
        </ion-button>
        <ion-button
          id="updateAll"
          @click="updateAll"
          :disabled="updateLoading"
          v-vibration="5"
        >
          <ion-icon :icon="refresh" v-if="!updateLoading"></ion-icon>
          <div v-else style="display: flex; align-items: center">
            <ion-spinner name="bubbles"></ion-spinner>
            {{ updateIndex + 1 }} / {{ roomList.length }}
          </div>
        </ion-button>
        <ion-button
          id="updateAll"
          :disabled="updateLoading"
          @click="sortList"
          v-vibration="5"
        >
          <ion-icon :icon="swapVerticalOutline"></ion-icon>
        </ion-button>
        <ion-button id="updateAll" @click="goTop" v-vibration="5">
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
          <ion-button @click="cancel(menuModal)" v-vibration="5">
            关闭
          </ion-button>
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
            :clear-input="true"
            placeholder="请输入直播间的 ID"
          ></ion-input>
        </ion-item>
        <ion-radio-group v-model:modelValue="data.type">
          <ion-item>
            <ion-radio value="bili">B站</ion-radio>
          </ion-item>
          <ion-item>
            <ion-radio value="douyu">斗鱼</ion-radio>
          </ion-item>
        </ion-radio-group>
        <ion-button
          style="margin-top: 20px; width: 100%"
          :disabled="inputLoading || addloading"
          @click="add()"
          v-vibration="5"
        >
          <ion-spinner v-if="addloading" name="bubbles"></ion-spinner>
          添加
        </ion-button>
      </div>

      <div class="padding">
        <ion-item>
          <ion-label position="stacked">JSON</ion-label>
          <ion-input
            ref="input"
            label=""
            type="text"
            v-model:modelValue="jsonData"
            :clear-input="true"
            placeholder="输入JSON代码"
            :disabled="inputLoading"
          ></ion-input>
        </ion-item>
        <ion-button
          style="margin-top: 10px; width: 100%"
          @click="inputData"
          :disabled="inputLoading"
          v-vibration="5"
        >
          <span v-if="!inputLoading">导入</span>
          <div v-else style="display: flex; align-items: center">
            <ion-spinner name="bubbles"></ion-spinner>
            {{ inputMsg }}
          </div>
        </ion-button>
        <ion-button
          style="margin-top: 10px; width: 100%"
          @click="outData"
          v-vibration="5"
          :disabled="inputLoading"
          >导出</ion-button
        >
        <ion-button
          style="margin-top: 10px; width: 100%"
          @click="inputDefData"
          v-vibration="5"
          :disabled="inputLoading"
          >导入默认数据</ion-button
        >
      </div>
    </ion-content>
  </ion-modal>

  <ion-action-sheet
    ref="actionSheet"
    class="my-custom-class"
    :is-open="isOpen"
    header="设置"
    :buttons="actionSheetButtons"
    @didDismiss="setResult($event)"
  ></ion-action-sheet>

  <ion-alert
    ref="alertRef"
    :is-open="isOpenAlert"
    header="确认"
    sub-header="确认删除"
    :message="currentSelectRoom === null ? '' : `${currentSelectRoom.name}`"
    :buttons="['取消', { text: '确定', role: 'confirm' }]"
    @didDismiss="closeOlose($event)"
  ></ion-alert>
</template>

<script setup lang="ts">
import {
  IonButtons,
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
  IonRadio,
  IonRadioGroup,
  IonActionSheet,
  IonAlert,
} from '@ionic/vue';

import { computed, reactive, ref } from 'vue';
import {
  personAddOutline,
  swapVerticalOutline,
  arrowUpOutline,
  refresh,
} from 'ionicons/icons';
import MenuItem from './item.vue';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { Clipboard } from '@capacitor/clipboard';
import '@/theme/hideScrollbar.css';
import { message } from '@/utils/message';
import defRoomList from '@/config/roomList';
import { isPhone } from '@/utils/isMobile';
import { useBackButton } from '@ionic/vue';
import { Platform, PlayerItem, RoomListItem } from '@/types/player';
import { onClickOutside } from '@vueuse/core';
import { vibrate } from '@/utils/impact';

defineOptions({ name: 'MenuList' });

const playerStore = usePlayerStore();
const { roomList, menuState, topRoomList } = storeToRefs(playerStore);

const data = reactive<{
  roomId: number | undefined;
  type: Platform;
}>({
  roomId: undefined,
  type: Platform.Bili,
});

const menuModal = ref(),
  actionSheet = ref(),
  menuWrap = ref(),
  outModal = ref(),
  jsonData = ref(''),
  updateLoading = ref(false),
  updateIndex = ref(0),
  searchKeyWorld = ref(''),
  menuContentRef = ref(),
  isOpen = ref(false),
  isOpenAlert = ref(false),
  alertRef = ref(),
  currentSelectRoom = ref<RoomListItem | null>(null),
  inputLoading = ref(false),
  inputMsg = ref(''),
  addloading = ref(false);

function cancel(vn: any) {
  vibrate(5);
  vn.$el.dismiss(null, 'cancel');
}

async function closeOlose(ev: CustomEvent) {
  if (ev.detail.role === 'confirm') {
    const item = currentSelectRoom.value;
    if (item !== null) {
      await playerStore.removeRoom(item.roomId, item.platform);
    }
  }
  isOpenAlert.value = false;
}

async function add() {
  vibrate(5);
  addloading.value = true;
  if (data.roomId === undefined) return;
  const type = data.type;
  const roomId = data.roomId;

  try {
    await playerStore.addRoom(roomId, type);
    sortList();
  } catch (error) {
    // console.log(error);
  }
  addloading.value = false;
}

function dragItem() {
  menuState.value = false;
}

async function inputData() {
  inputLoading.value = true;
  try {
    if (jsonData.value.length === 0) return;
    const list: PlayerItem[] = JSON.parse(jsonData.value);
    inputMsg.value = `0 / ${list.length}`;
    for (const key in list) {
      await playerStore.addRoom(list[key].roomId, list[key].platform, false);
      inputMsg.value = `${Number(key) + 1} / ${list.length}`;
    }

    await message('更新成功!');
  } catch (error) {
    await message('更新失败!');
    // console.log(error);
  }
  inputMsg.value = '';
  inputLoading.value = false;
}

async function outData() {
  const list = roomList.value.map((item) => ({
    roomId: item.roomId,
    platform: item.platform,
  }));
  await Clipboard.write({
    string: JSON.stringify(list),
  });
  await message('复制成功!');
}

async function updateAll() {
  updateLoading.value = true;
  updateIndex.value = 0;
  for (let index = 0; index < roomList.value.length; index++) {
    try {
      await playerStore.updateRoomInfo(
        roomList.value[index].roomId,
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
  const tmpList = roomList.value.sort((a, b) => {
    return checkStatus(b.status) - checkStatus(a.status);
  });
  for (const index in topRoomList.value) {
    const findIndex = tmpList.findIndex(
      (item) =>
        topRoomList.value[index].platform === item.platform &&
        topRoomList.value[index].roomId === item.roomId,
    );
    // 如果在置顶列表里移到第一位
    if (findIndex !== -1) {
      tmpList.unshift(tmpList.splice(findIndex, 1)[0]);
    }
  }
  roomList.value = tmpList;
}

function goTop() {
  menuContentRef.value.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

async function inputDefData() {
  jsonData.value = defRoomList;
  await inputData();
}

const searchByName = computed(() => {
  return roomList.value.filter(
    (item) => item.name.search(searchKeyWorld.value) !== -1,
  );
});

// 打开设置
const setOpen = (item: RoomListItem | null = null) => {
  vibrate(15);
  isOpen.value = true;
  currentSelectRoom.value = item;
};

// 设置回调
const setResult = async (ev: CustomEvent) => {
  const item = currentSelectRoom.value;
  if (item !== null) {
    vibrate(15);
    switch (ev.detail.role) {
      case 'delete':
        isOpenAlert.value = true;
        break;
      case 'top':
        playerStore.addTop(item.roomId, item.platform);
        sortList();
        break;
      case 'cancelTop':
        playerStore.removeTop(item.roomId, item.platform);
        sortList();
        break;
    }
  }
  isOpen.value = false;
};

const actionSheetButtons = computed(() => {
  const defBtns = [
    {
      text: '删除',
      role: 'delete',
      cssClass: 'del',
    },
    {
      text: '取消',
      role: 'cancel',
    },
  ];
  const room = currentSelectRoom.value;
  if (room !== null) {
    const isTop = topRoomList.value.find(
      (item) => item.platform === room.platform && item.roomId === room.roomId,
    );
    if (isTop === undefined) {
      defBtns.splice(1, 0, {
        text: '置顶',
        role: 'top',
      });
      return defBtns;
    } else {
      defBtns.splice(1, 0, {
        text: '取消置顶',
        role: 'cancelTop',
      });
      return defBtns;
    }
  } else {
    return defBtns;
  }
});

onClickOutside(menuWrap, () => (menuState.value = false), {
  ignore: [menuModal, menuWrap, outModal, actionSheet, alertRef],
});

if (isPhone()) {
  // 监听系统返回
  useBackButton(10, () => {
    menuState.value = false;
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
