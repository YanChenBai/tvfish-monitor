<template>
  <div class="wrap">
    <div class="danmu" @click="openControl"></div>
    <div class="video" ref="videoRef"></div>
    <Control ref="controlRef"></Control>
  </div>
</template>

<script setup lang="ts">
import DPlayer from 'dplayer';
import { usePlayer } from '@/hooks/usePlayer';
import { computed, onMounted, provide, reactive, ref } from 'vue';
import { playerProvide, playerWrapProvide } from '@/utils/provides';
import Control from './control.vue';
import injectStrict from '@/utils/injectStrict';
import { UsePlayer } from '@/types/playerNew';
defineOptions({ name: 'PlayerComponent' });

const { playerConfig, liveConfig } = injectStrict(playerWrapProvide);
const videoRef = ref<HTMLDivElement>(),
  controlRef = ref<InstanceType<typeof Control>>();

// 初始化
onMounted(() => {
  const player = usePlayer(videoRef, liveConfig);
  player.dplayer.volume(playerConfig.value.volume, false, false);
  provide(playerProvide, player);
});
// 打开控制栏
const openControl = () =>
  controlRef.value ? controlRef.value.openControl() : '';
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
  width: 100%;
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
