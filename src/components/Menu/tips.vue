<template>
  <ion-popover :is-open="isOpen" @didDismiss="isOpen = false">
    <ion-content class="ion-padding">
      <template v-if="content">
        <p class="room-name">{{ content.name }}</p>
        <p>
          直播间ID:
          <span class="tips-item">{{ content.roomId }}</span>
        </p>
        <p>
          平台:
          <span class="tips-item">{{
            content.platform === Platform.Bili ? 'B站' : '斗鱼'
          }}</span>
        </p>
        <p>
          标题: <span class="tips-item">{{ content.title }}</span>
        </p>
        <p>
          公告: <span class="tips-item">{{ content.news }}</span>
        </p>
        <p>
          Tags: <span class="tips-item">{{ content.tags }}</span>
        </p>
        <ion-button @click="copyRoomAddress" v-vibration="5"
          >复制直播间地址</ion-button
        >
      </template>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import { RoomListItem, Platform } from '@/types/player';
import { IonButton, IonContent, IonPopover } from '@ionic/vue';
import { ref } from 'vue';
import { Clipboard } from '@capacitor/clipboard';
import { message } from '@/utils/message';

defineOptions({ name: 'MenuTips' });

const isOpen = ref(false),
  content = ref<RoomListItem | null>(null);

// 复制直播间地址
async function copyRoomAddress() {
  if (content.value !== null) {
    const address =
      (content.value.platform === Platform.Bili
        ? 'https://live.bilibili.com/'
        : 'https://www.douyu.com/') + content.value.roomId;
    await Clipboard.write({
      string: address,
    });
    await message('复制成功!');
  }
}

// 打开提示
const open = (item: RoomListItem) => {
  isOpen.value = true;
  content.value = item;
};

defineExpose({ open });
</script>

<style scoped>
.room-name {
  font-size: 16px;
  font-weight: 600;
}
.tips-item {
  opacity: 0.8;
}
</style>
