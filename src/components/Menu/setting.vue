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
    :message="
      selectRoom
        ? `${selectRoom.platform === Platform.Bili ? 'b站' : '斗鱼'}/${
            selectRoom.roomId
          }/${selectRoom.name}`
        : ''
    "
    :buttons="alertButtons"
    @didDismiss="() => (removeIsopen = false)"
  ></ion-alert>
</template>

<script setup lang="ts">
import { vibrate } from '@/utils/impact';
import { ActionSheetButton, IonActionSheet, IonAlert } from '@ionic/vue';
import { computed, ref } from 'vue';
import RoomStore from '@/stores/room';
import injectStrict from '@/utils/injectStrict';
import { repoProvides } from '@/utils/provides';
import { Platform } from '@/types/player';
import useRoom from '@/hooks/useRoom';

defineOptions({ name: 'MenuSetting' });

const { roomRepo } = injectStrict(repoProvides);
const useroom = useRoom(roomRepo);

const actionSheetRef = ref(),
  actionSheetIsOpen = ref(false),
  removeAlertRef = ref(),
  removeIsopen = ref(false),
  selectRoom = ref<RoomStore>();

// 处理
function handler(status: boolean) {
  vibrate(5);
  if (selectRoom.value) {
    roomRepo
      .where('roomTypeId', selectRoom.value.roomTypeId)
      .update({ isTop: status });
  }
}

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

  if (selectRoom.value) {
    const { isTop } = roomRepo
      .where('roomTypeId', selectRoom.value.roomTypeId)
      .first()!;
    if (isTop === false) {
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
      if (selectRoom.value)
        useroom.remove(selectRoom.value.roomId, selectRoom.value.platform);
    },
  },
];

function open(room: RoomStore) {
  actionSheetIsOpen.value = true;
  selectRoom.value = room;
}

defineExpose({
  open,
  ignore: [actionSheetRef, removeAlertRef],
});
</script>

<style scoped></style>
