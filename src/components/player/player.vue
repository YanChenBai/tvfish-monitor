<template>
  <div class="live-danmu-player">
    <div ref="danmakuWrapRef" class="danmu-wrap" @click="openControl()">
      <VueDanmuKu
        style="width: 100%; height: 100%"
        autoplay
        ref="danmakuRef"
        :danmus="[]"
        :channels="5"
        :speeds="60"
        :fontSize="22"
      ></VueDanmuKu>
    </div>
    <div class="video-wrap">
      <video ref="videoRef" autoplay></video>
    </div>
    <Control
      @destroy="destroy()"
      @refresh="refresh()"
      @volume-change="modifyVolume"
      v-model:show="show"
      :danmakuRef="danmakuRef"
      ref="controlRef"
      :title="title"
      :name="name"
      :lines="lines"
      :qualitys="qualitys"
    />
  </div>
</template>

<script setup lang="ts">
import VueDanmuKu from 'vue3-danmaku';
import { onMounted, ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import Control from '@/components/player/control.vue';
import { ConfigType } from '@/hooks/player';
import Player from '@/hooks/player';
import { QualityType, LineType } from '@/types/player';
import { showBar } from '@/utils/barStatus';
import { RoomListItem, usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'LiveDanmuPlayer' });

const { playerListConfig } = storeToRefs(usePlayerStore());
const props = withDefaults(
  defineProps<{
    title?: string;
    lines: LineType[];
    qualitys: QualityType[];
    url: string;
    type: ConfigType;
    name: string;
  }>(),
  { title: '' },
);
const emit = defineEmits(['volumeChange']);
const show = ref(false);
const player = ref<Player | null>(null);
const controlRef = ref<InstanceType<typeof Control>>(),
  danmakuRef = ref<InstanceType<typeof VueDanmuKu>>(),
  danmakuWrapRef = ref(),
  videoRef = ref<HTMLMediaElement>();

// 打开控制栏
const openControl = () =>
  controlRef.value ? controlRef.value.openControl() : '';
function destroy() {
  player.value!.destroy();
}

function refresh() {
  const config = {
    url: props.url,
    type: props.type,
    defVol: playerListConfig.value[props.name].volume,
  };
  if (player.value === null) {
    player.value = new Player(videoRef.value!, config);
    player.value.init();
  } else {
    player.value.refresh(config);
  }
}

function modifyVolume(val: number) {
  emit('volumeChange', val);
  if (player.value === null) return;
  player.value.modifyVolume(val);
}

onMounted(() => {
  // 关闭控制栏
  onClickOutside(danmakuWrapRef, () => controlRef.value!.closeControl(), {
    ignore: [...controlRef.value!.getIgnore()],
  });
});

// 自动切换配置
watch(
  (): [string, ConfigType] => [props.url, props.type],
  (val) => {
    if (val[0] !== '') {
      setTimeout(() => refresh(), 0);
    }
  },
);

// 暴露函数
defineExpose({
  refresh,
  modifyVolume,
});
</script>

<style scoped>
.live-danmu-player,
.danmu-wrap {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
}
.live-danmu-player {
  position: relative;
  background: rgb(31, 31, 31);
  display: flex;
  align-items: center;
  justify-content: center;
}
.danmu-wrap {
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.danmu-wrap {
  color: #fff;
  z-index: 99;
}

.video-wrap {
  height: 100%;
  position: relative;
  z-index: 9;
}
.video-wrap video {
  position: relative;
  height: 100%;
  width: 100%;
  z-index: 9;
}
</style>
