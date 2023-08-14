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
import { computed, inject, onMounted, provide, ref } from 'vue';
import { playerProvide, playerWrapProvide } from '@/utils/provides';
import Control from './control.vue';
defineOptions({ name: 'PlayerComponent' });

const { player, config } = inject(playerWrapProvide)!;
const videoRef = ref<HTMLMediaElement>(),
  controlRef = ref<InstanceType<typeof Control>>();
const volume = computed(() => (player.value?.volume ? player.value.volume : 0));
let destroy: { (): void } = () => null,
  refresh: { (): void } = () => null;
// 初始化
onMounted(() => {
  if (videoRef.value) {
    const dp = new DPlayer({
      container: videoRef.value,
      live: true,
      mutex: false,
      preventClickToggle: true,
      hotkey: false,
      video: {
        url: '',
        type: 'autoType',
        customType: {
          autoType() {
            //
          },
        },
      },
    });
    dp.volume(volume.value, true, true);
    const { destroy: playerDestroy, refresh: playerRefresh } = usePlayer(
      dp.video,
      config,
    );
    destroy = playerDestroy;
    refresh = playerRefresh;
  }
});
// 打开控制栏
const openControl = () =>
  controlRef.value ? controlRef.value.openControl() : '';
provide(playerProvide, { refresh, destroy });
</script>

<style scoped>
.wrap {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
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
