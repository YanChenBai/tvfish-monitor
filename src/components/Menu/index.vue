<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrap" v-show="menuState">
      <!-- 搜索直播间 -->
      <div>
        <ion-input
          style="min-height: 26px; margin-bottom: 10px; color: #ffff"
          color="primary"
          placeholder="搜索主播"
          :clear-input="true"
          v-model:modelValue="keyWorldDebounced"
        ></ion-input>
      </div>

      <!-- 直播间列表 -->
      <div class="menu-content hide-scrollbar" ref="menuContentRef">
        <div v-for="item in searchByName" class="menu-content-item">
          <MenuItem
            :key="`${item.platform}@${item.roomId}`"
            :disabled="updateLoading"
            :info="item"
            @drag="dragItem"
            @setting="openSet(item)"
            @tips="openTips(item)"
          ></MenuItem>
        </div>
      </div>

      <!-- 操作的按钮 -->
      <div class="add">
        <ion-button v-vibration="5">
          {{ searchByName.length }}
        </ion-button>

        <!-- 添加/导入/导出按钮 -->
        <ion-button id="menuModal" :disabled="updateLoading" v-vibration="5">
          <ion-icon :icon="personAddOutline"></ion-icon>
        </ion-button>

        <!-- 更新全部 -->
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

        <!-- 整理顺序 -->
        <ion-button :disabled="updateLoading" @click="sortList" v-vibration="5">
          <ion-icon :icon="swapVerticalOutline"></ion-icon>
        </ion-button>

        <!-- 直播间列表返回顶部 -->
        <ion-button @click="goTop" v-vibration="5">
          <ion-icon :icon="arrowUpOutline"></ion-icon>
        </ion-button>
      </div>
    </div>
  </Transition>

  <!-- 添加直播间 / 导入 / 导出 的模态框 -->
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

  <!-- 设置的弹窗 -->
  <ion-action-sheet
    ref="actionSheet"
    class="my-custom-class"
    :is-open="isOpen"
    header="设置"
    :buttons="actionSheetButtons"
    @didDismiss="isOpen = false"
  ></ion-action-sheet>

  <!-- 确认删除弹窗 -->
  <ion-alert
    ref="removeAlertRef"
    :is-open="removeIsopen"
    header="确认"
    sub-header="确认删除"
    :message="currentSelectRoom === null ? '' : `${currentSelectRoom.name}`"
    :buttons="alertButtons"
    @didDismiss="() => (removeIsopen = false)"
  ></ion-alert>

  <ion-popover
    ref="tipsPopoverRef"
    :is-open="tipsPopover.isOpen"
    trigger="click-trigger"
    trigger-action="click"
    @didDismiss="tipsPopover.isOpen = false"
  >
    <ion-content class="ion-padding">
      <template v-if="tipsPopover.content">
        <p class="room-name">{{ tipsPopover.content.name }}</p>
        <p>
          直播间ID:
          <span class="tips-item">{{ tipsPopover.content.roomId }}</span>
        </p>
        <p>
          平台: <span class="tips-item">{{ tipsPopover.content.roomId }}</span>
        </p>
        <p>
          标题: <span class="tips-item">{{ tipsPopover.content.title }}</span>
        </p>
        <p>
          公告: <span class="tips-item">{{ tipsPopover.content.news }}</span>
        </p>
        <ion-button @click="copyRoomAddress" v-vibration="5">复制直播间地址</ion-button>
      </template>
    </ion-content>
  </ion-popover>
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
  IonPopover,
  ActionSheetButton,
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
import { onClickOutside, watchDebounced } from '@vueuse/core';
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
  keyWorldDebounced = ref(''),
  keyWorld = ref(''),
  menuContentRef = ref(),
  isOpen = ref(false),
  removeIsopen = ref(false),
  removeAlertRef = ref(),
  currentSelectRoom = ref<RoomListItem | null>(null),
  inputLoading = ref(false),
  inputMsg = ref(''),
  addloading = ref(false),
  tipsPopoverRef = ref(),
  tipsPopover = reactive<{
    isOpen: boolean;
    content: RoomListItem | null;
  }>({
    isOpen: false,
    content: null,
  });

// 关闭模态框
function cancel(vn: any) {
  vibrate(5);
  vn.$el.dismiss(null, 'cancel');
}

// 添加数据
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

// 导入数据
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

// 导出
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

// 复制直播间地址
async function copyRoomAddress() {
  if (tipsPopover.content !== null) {
    const address =
      (tipsPopover.content.platform === Platform.Bili
        ? 'https://live.bilibili.com/'
        : 'https://www.douyu.com/') + tipsPopover.content.roomId;
    await Clipboard.write({
      string: address,
    });
    await message('复制成功!');
  }
}

// 更新全部
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

// 排序
const checkStatus = (status: number) => (status === 1 ? 1 : 0);
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

// 返回顶部
function goTop() {
  menuContentRef.value.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// 导入默认数据
async function inputDefData() {
  jsonData.value = defRoomList;
  await inputData();
}

// 名字搜索
const searchByName = computed(() => {
  return roomList.value.filter(
    (item) => item.name.search(keyWorld.value) !== -1,
  );
});

// 打开设置
const openSet = (item: RoomListItem | null = null) => {
  vibrate(15);
  isOpen.value = true;
  currentSelectRoom.value = item;
};

// 打开提示
const openTips = (item: RoomListItem | null = null) => {
  tipsPopover.isOpen = true;
  tipsPopover.content = item;
};

// 按钮回调
const actionSheetButtons = computed(() => {
  const defBtns: ActionSheetButton[] = [
    {
      text: '删除',
      role: 'delete',
      cssClass: 'del',
      handler: () => {
        vibrate(5);
        removeIsopen.value = true;
      },
    },
    {
      text: '取消',
      role: 'cancel',
      handler: () => vibrate(5),
    },
  ];

  const room = currentSelectRoom.value;
  if (room !== null) {
    const isTop = topRoomList.value.find(
      (item) => item.platform === room.platform && item.roomId === room.roomId,
    );
    if (isTop === undefined) {
      defBtns.unshift({
        text: '置顶',
        role: 'top',
        handler() {
          vibrate(5);
          if (currentSelectRoom.value === null) return;
          playerStore.addTop(
            currentSelectRoom.value.roomId,
            currentSelectRoom.value.platform,
          );
          sortList();
        },
      });
      return defBtns;
    } else {
      defBtns.unshift({
        text: '取消置顶',
        role: 'cancelTop',
        handler: () => {
          vibrate(5);
          if (currentSelectRoom.value === null) return;
          playerStore.removeTop(
            currentSelectRoom.value.roomId,
            currentSelectRoom.value.platform,
          );
          sortList();
        },
      });
      return defBtns;
    }
  } else {
    return defBtns;
  }
});

// 按钮回调
const alertButtons = [
  {
    text: '取消',
    handler: () => vibrate(5),
  },
  {
    text: '确定',
    role: 'confirm',
    handler() {
      vibrate(5);
      const item = currentSelectRoom.value;
      if (item !== null) {
        playerStore.removeRoom(item.roomId, item.platform);
      }
    },
  },
];

// 搜索节流
watchDebounced(keyWorldDebounced, (val) => (keyWorld.value = val), {
  debounce: 100,
  maxWait: 1000,
});

// 关闭Menu
onClickOutside(menuWrap, () => (menuState.value = false), {
  ignore: [
    menuModal,
    menuWrap,
    outModal,
    actionSheet,
    removeAlertRef,
    tipsPopoverRef,
  ],
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

.room-name {
  font-size: 16px;
  font-weight: 600;
}
.tips-item {
  opacity: 0.8;
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
