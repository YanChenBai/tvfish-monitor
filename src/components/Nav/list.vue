<template>
  <ion-button
    color="light"
    fill="clear"
    id="playerlistSetting"
    v-vibration="5"
    size="small"
    @click="popoverOpen = true"
  >
    <ion-icon :icon="listCircleOutline"></ion-icon>
  </ion-button>

  <ion-popover :is-open="popoverOpen" @didDismiss="popoverOpen = false">
    <ion-content>
      <div class="box hide-scrollbar">
        <div class="item" v-for="(item, key) in list" :key="key">
          <div class="name">
            <div class="face" v-if="item.room">
              <img :src="`${IMAGE_PROXY}?w=80&h=80&url=${item.room.face}`" />
            </div>
            <div class="win">{{ key + 1 }}</div>
            <template v-if="!item.room">未分配</template>
            <template v-else>
              {{ item.room.name }}
            </template>
          </div>
          <div class="vol">
            <div class="vol-num">{{ item.volume }}</div>
            <ion-range
              style="width: 240px"
              @ionChange="
                ({ detail }) =>
                  playerRepo.save({ id: item.id, volume: detail.value })
              "
              :value="item.volume"
            ></ion-range>
          </div>
          <div class="danmu-box">
            <div class="danmu">弹幕</div>
            <ion-toggle
              @ionChange="
                ({ detail: { checked } }) =>
                  playerRepo.save({ id: item.id, danmu: checked })
              "
              :checked="item.danmu"
              v-vibration="5"
            ></ion-toggle>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import {
  IonPopover,
  IonContent,
  IonButton,
  IonIcon,
  IonRange,
  IonToggle,
} from '@ionic/vue';
import { listCircleOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { IMAGE_PROXY } from '@/config/proxy';
import injectStrict from '@/utils/injectStrict';
import { repoProvides } from '@/utils/provides';

defineOptions({ name: 'PlayerlistSetting' });
const { playerRepo } = injectStrict(repoProvides);

const popoverOpen = ref(false);
const list = computed(() => playerRepo.with('room').get());
</script>

<style scoped>
@import '../../theme/hideScrollbar.css';
.box {
  height: 600px;
  overflow-y: scroll;
  padding: 20px;
  box-sizing: border-box;
}
.name {
  padding: 4px 0;
  display: flex;
  align-items: center;
}
.vol-num,
.danmu {
  width: 50px;
  padding: 2px 0;
  border: 2px solid #42424263;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-right: 14px;
}
.face {
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  margin-right: 6px;
}
.win {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #428cff;
  margin-right: 6px;
}
.vol {
  display: flex;
  align-items: center;
}
.danmu-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.face img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}
.item {
  padding-bottom: 10px;
}
.item:not(:last-child) {
  border-bottom: 1px solid #42424263;
  margin-bottom: 10px;
}
ion-popover {
  --width: 360px;
}
</style>
