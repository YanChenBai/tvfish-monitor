<template>
  <Transition name="control">
    <div
      v-show="show"
      class="control-wrap"
      @mouseleave="closeControl()"
      @click="closeControl()"
      @touchmove.prevent="closeControl()"
    >
      <div class="control-wrap-top" ref="topRef">
        <div class="title">
          <div
            class="name status"
            :class="{
              [roomStatusClass[
                playerConfig.room ? playerConfig.room.status : 0
              ]]: true,
            }"
          >
            {{ playerConfig.id + 1 }}
          </div>
          <div class="content" v-if="playerConfig.room">
            {{ playerConfig.room.name }} -
            {{ playerConfig.room.title }}
          </div>
        </div>
        <ion-button
          color="danger"
          fill="clear"
          size="small"
          @click="destroy()"
          v-vibration="10"
        >
          <ion-icon :icon="close"></ion-icon>
        </ion-button>
      </div>

      <div class="control-wrap-bottom" ref="bottomRef">
        <div class="left">
          <ion-button
            color="light"
            fill="clear"
            size="small"
            @click="refresh()"
            v-vibration="5"
          >
            <ion-icon :icon="refreshIcon"></ion-icon>
          </ion-button>

          <PlayerSlider>
            <template #target>
              <ion-button
                color="light"
                fill="clear"
                size="small"
                v-vibration="5"
              >
                <ion-icon :icon="volumeHigh"></ion-icon>
                <div class="volume">{{ playerConfig.volume }}</div>
              </ion-button>
            </template>
          </PlayerSlider>
        </div>
        <div class="right">
          <ion-button
            color="light"
            fill="clear"
            size="small"
            @click="danmuSwitch()"
            v-vibration="5"
            >弹幕 {{ playerConfig.danmu ? '关' : '开' }}</ion-button
          >
          <PopoverSelect :list="liveConfig.qualitys" @change="qualityChange">
            <template #target>
              <ion-button
                color="light"
                fill="clear"
                size="small"
                v-vibration="5"
              >
                {{ qualityChangeName }}
              </ion-button>
            </template>
          </PopoverSelect>
          <PopoverSelect :list="liveConfig.lines" @change="lineChange">
            <template #target>
              <ion-button
                color="light"
                fill="clear"
                size="small"
                v-vibration="5"
              >
                {{ currentLineName }}
              </ion-button>
            </template>
          </PopoverSelect>

          <ion-button
            v-vibration="5"
            color="light"
            fill="clear"
            size="small"
            @click="closeControl()"
          >
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { IonButton, IonIcon } from '@ionic/vue';
import PopoverSelect from './select.vue';
import PlayerSlider from './slider.vue';
import { refresh as refreshIcon, volumeHigh, close, key } from 'ionicons/icons';
import { Ref, computed, ref } from 'vue';
import { QualityType, LineType } from '@/types/playerNew';
import {
  playerProvides,
  playerWrapProvides,
  repoProvides,
} from '@/utils/provides';
import injectStrict from '@/utils/injectStrict';

defineOptions({ name: 'PlayerControl' });

const roomStatusClass = ['close', 'live', 'rec', 'def'];
const { navState } = storeToRefs(usePlayerStore());
const player = injectStrict(playerProvides);
const { playerConfig, liveConfig, clearLiveConfig, update } =
  injectStrict(playerWrapProvides);
const { playerRepo } = injectStrict(repoProvides);

const show = ref(false),
  topRef = ref<HTMLElement>(),
  bottomRef = ref<HTMLElement>();

const currentLineName = computed(() => {
  if (liveConfig.line === null) {
    return '线路';
  } else {
    return liveConfig.lines.find((item) => item.line === liveConfig.line)?.name;
  }
});

const qualityChangeName = computed(() => {
  if (liveConfig.quality === null) {
    return '线路';
  } else {
    return liveConfig.qualitys.find((item) => item.qn === liveConfig.quality)
      ?.name;
  }
});

function destroy() {
  player.destroy();
  clearLiveConfig();
  playerRepo.where('id', playerConfig.value.id).update({ roomTypeId: '' });
}

async function refresh() {
  update();
}

const qualityChange = (item: QualityType) => {
  const tmp = liveConfig.quality;
  liveConfig.quality = item.qn;
  if (tmp) update();
};

const lineChange = (item: LineType) => {
  const tmp = liveConfig.line;
  liveConfig.line = item.line;
  if (tmp) update();
};

const danmuSwitch = () => {
  playerRepo.where('id', playerConfig.value.id).update({
    danmu: !playerConfig.value.danmu,
  });
};

let time = 0;
const openControl = () => {
  show.value = true;
  navState.value = true;
  time = setTimeout(() => closeControl(), 5000);
};

const closeControl = () => {
  show.value = false;
  clearTimeout(time);
};

// 获取关闭控制栏时点击需要排除的地方
function getIgnore(): Ref<HTMLElement | undefined>[] {
  return [topRef, bottomRef];
}

// 暴露函数
defineExpose({
  getIgnore,
  openControl,
  closeControl,
});
</script>

<style scoped>
.control-wrap {
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  padding: 0;
  box-sizing: border-box;
  opacity: 1;
  z-index: 999;
}

.control-wrap-top {
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.7);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.control-wrap-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.volume {
  width: 24px;
}

.title {
  display: flex;
  align-items: center;
  line-height: 18px;
  padding-left: 6px;
  width: calc(100% - 60px);
}

.title .content {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name {
  background-color: #333333;
  padding: 2px 10px;
  border-radius: 4px;
  margin-right: 4px;
  text-transform: uppercase;
}

.control-enter-active,
.control-leave-active {
  transition: opacity 0.3s ease;
}

.control-enter-from,
.control-leave-to {
  opacity: 0;
}
.status.close {
  background-color: #f4f5f8;
  color: #6d6c6c;
}
.status.live {
  background-color: #ff4961;
}
.status.rec {
  background-color: #428cff;
}
</style>
