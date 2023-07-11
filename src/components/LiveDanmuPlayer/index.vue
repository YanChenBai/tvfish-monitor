<template>
  <div class="live-danmu-player" :ref="(node: any) => drag(drop(node))">
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
    />
  </div>
</template>

<script setup lang="ts">
import { useDrag, useDrop } from 'vue3-dnd';
import { onMounted, ref, watch } from 'vue';
import Control from './control.vue';
import VueDanmuKu from 'vue3-danmaku';
import { onClickOutside } from '@vueuse/core';
import { Config, ConfigType } from './type';
import Player from './index';

defineOptions({ name: 'LiveDanmuPlayer' });

const props = withDefaults(
  defineProps<{
    title?: string;
    lines?: Array<{ label: string; value: string }>;
    qualitys?: Array<{ label: string; value: string }>;
    url: string;
    type: ConfigType;
    name: string;
  }>(),
  { title: '' },
);

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
  };
  if (player.value === null) {
    player.value = new Player(videoRef.value!, config);
    player.value.init();
  } else {
    player.value.refresh(config);
  }
}

function modifyVolume(val: number) {
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
    if (val[0].length !== 0 && val !== null) {
      refresh();
    }
  },
);

// 创建拖拽
const [, drag] = useDrag({
  type: 'video',
  item: {
    type: 'player',
  },
});

// 创建拖拽放置
const [, drop] = useDrop({
  accept: ['box', 'video'],
  drop: (item: any) => {
    alert(item);
  },
});

// 暴露函数
defineExpose({
  refresh,
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
