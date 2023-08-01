<template>
  <!-- 设置的弹窗 -->
  <ion-action-sheet
    ref="actionSheetRef"
    class="my-custom-class"
    :is-open="actionSheetIsOpen"
    header="设置"
    :buttons="actionSheetButtons"
    @didDismiss="actionSheetIsOpen = false"
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
</template>

<script setup lang="ts">
import { RoomListItem } from '@/types/player';
import { vibrate } from '@/utils/impact';
import { ActionSheetButton, IonActionSheet, IonAlert } from '@ionic/vue';
import { computed, ref } from 'vue';
import { sortList } from '@/hooks/useMenu';
import useRoomList from '@/hooks/useRoomList';
import useTopRoom from '@/hooks/useTopRoom';

defineOptions({ name: 'MenuSetting' });

const topRoom = useTopRoom();
const roomList = useRoomList();

const actionSheetRef = ref(),
  actionSheetIsOpen = ref(false),
  removeAlertRef = ref(),
  removeIsopen = ref(false),
  currentSelectRoom = ref<RoomListItem | null>(null);

const getInfo = () => {
  if (currentSelectRoom.value) {
    return {
      roomId: currentSelectRoom.value.roomId,
      platform: currentSelectRoom.value.platform,
    };
  } else {
    return null;
  }
};

// 处理
function handler(type: boolean) {
  vibrate(5);
  const room = getInfo();
  if (room) {
    if (type) {
      topRoom.create(room);
    } else {
      topRoom.remove(room);
    }
    sortList();
  }
}

// 按钮回调
const actionSheetButtons = computed(() => {
  const room = getInfo();
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

  if (room) {
    const isTop = topRoom.queryOne({
      roomId: room.roomId,
      platform: room.platform,
    });
    if (isTop === null) {
      defBtns.unshift({
        text: '置顶',
        role: 'top',
        handler: () => handler(true),
      });
      return defBtns;
    } else {
      defBtns.unshift({
        text: '取消置顶',
        role: 'cancelTop',
        handler: () => handler(false),
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
      const room = getInfo();
      if (room) roomList.remove(room.roomId, room.platform);
    },
  },
];

function open(room: RoomListItem) {
  actionSheetIsOpen.value = true;
  currentSelectRoom.value = room;
}

defineExpose({
  open,
  ignore: [actionSheetRef, removeAlertRef],
});
</script>

<style scoped></style>
