<template>
  <div class="wrap">
    <div class="video" ref="videoRef"></div>
  </div>
</template>

<script setup lang="ts">
import DPlayer from 'dplayer';
import { usePlayer, Config, ConfigType } from '@/hooks/usePlayer';
import { computed, inject, onMounted, onUnmounted, reactive, ref } from 'vue';
import { liveConfigProvide, playerProvide } from '@/utils/provides';

defineOptions({ name: 'PlayerComponent' });

const player = inject(playerProvide);
const liveConfig = inject(liveConfigProvide);

const videoRef = ref<HTMLMediaElement>();

const volume = computed(() =>
    player?.value?.volume ? player.value.volume : 0,
  ),
  danmu = computed(() => (player?.value?.danmu ? player.value.danmu : false));

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
    const { destroy, refresh } = usePlayer(dp.video, liveConfig);

    onUnmounted(() => destroy());
  }
});
</script>

<style scoped>
.wrap {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
}
</style>
