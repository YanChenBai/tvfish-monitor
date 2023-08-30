<template>
  <div class="wrap">
    <Danmu
      @click="openControl"
      @liveStart="liveStart"
      @liveEnd="closeLive"
    ></Danmu>
    <div class="video">
      <video ref="videoRef" autoplay v-show="isShow"></video>
    </div>
    <Control ref="controlRef"></Control>
  </div>
</template>

<script setup lang="ts">
import { autoRefresh, usePlayer } from '@/hooks/usePlayer';
import { computed, onMounted, provide, watch } from 'vue';
import { playerProvides, playerWrapProvides } from '@/utils/provides';
import Control from './control.vue';
import injectStrict from '@/utils/injectStrict';
import { templateRef } from '@vueuse/core';
import Danmu from './danmu.vue';
import { RoomStatus } from '@/types/player';

defineOptions({ name: 'PlayerComponent' });

const { playerConfig, liveConfig, update } = injectStrict(playerWrapProvides);
const videoRef = templateRef<HTMLMediaElement>('videoRef'),
  controlRef = templateRef<InstanceType<typeof Control>>('controlRef');

const player = usePlayer(videoRef, liveConfig);
const { start, clear } = autoRefresh(videoRef, update);
const isShow = computed(
  () =>
    playerConfig.value.room !== null &&
    playerConfig.value.room.status === RoomStatus.LIVE,
);
const { start: liveStart, clear: liveCloseClear } = autoRefresh(
  videoRef,
  update,
);
function closeLive() {
  clear();
  liveCloseClear();
  update();
  player.destroy();
}

// 初始化
onMounted(() => {
  player.setVolume(playerConfig.value.volume);
  if (playerConfig.value.room?.status === RoomStatus.LIVE) start();
});

// 打开控制栏
const openControl = () => controlRef.value.openControl();

watch(
  () => playerConfig.value.room?.status,
  (val) => {
    if (val === RoomStatus.LIVE) {
      start();
    } else {
      clear();
    }
  },
);

provide(playerProvides, player);

defineExpose(player);
</script>

<style scoped>
.wrap {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
}

.video {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}
.video video {
  width: 100%;
  height: 100%;
}

.danmu {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  position: absolute;
  z-index: 99;
}
</style>
