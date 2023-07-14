<template>
  <div class="live-danmu-player">
    <div ref="danmakuWrapRef" class="danmu-wrap" @click="openControl()">
      <VueDanmuKu
        style="width: 100%; height: 100%"
        autoplay
        ref="danmakuRef"
        :danmus="danmus"
        :channels="3"
        :speeds="60"
        :fontSize="22"
        :debounce="200"
        :isSuspend="true"
        extraStyle="color: rgb(63, 149, 224);text-shadow: 1px 1px 1px #000;"
      ></VueDanmuKu>
    </div>
    <div class="video-wrap">
      <video
        ref="videoRef"
        v-show="url !== '' || url !== null || url !== undefined"
        autoplay
      ></video>
    </div>
    <Control
      @destroy="destroy()"
      @refresh="updateLiveOrgin()"
      @volume-change="modifyVolume"
      v-model:show="show"
      :danmakuRef="danmakuRef"
      ref="controlRef"
      :name="name"
      :lines="lines"
      :qualitys="qualitys"
      @qualityChange="qualityChange"
      @lineChange="lineChange"
    />
  </div>
</template>

<script setup lang="ts">
import VueDanmuKu from 'vue3-danmaku';
import { onMounted, ref, watch } from 'vue';
import { onClickOutside, useDebounceFn } from '@vueuse/core';
import Control from '@/components/player/control.vue';
import { ConfigType } from '@/hooks/player';
import Player from '@/hooks/player';
import { QualityType, LineType } from '@/types/player';
import { Platform, usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import DouyuDanmu from '@/utils/douyuDanmu/douyu';
import { startListen } from 'blive-message-listener/browser';

defineOptions({ name: 'LiveDanmuPlayer' });

const props = defineProps<{
  lines: LineType[];
  qualitys: QualityType[];
  url: string;
  type: ConfigType;
  name: string;
}>();

const emit = defineEmits([
  'qualityChange', // 清晰切换
  'lineChange', // 线路切换
  'updateLiveOrgin',
]);

const { playerListConfig, playerList, layoutIndex } = storeToRefs(
  usePlayerStore(),
);

const show = ref(false),
  player = ref<Player | null>(null),
  danmus = ref([]),
  controlRef = ref<InstanceType<typeof Control>>(),
  danmakuRef = ref<InstanceType<typeof VueDanmuKu>>(),
  danmakuWrapRef = ref(),
  videoRef = ref<HTMLMediaElement>();

let closeDanmu = (): any => ({});

// 打开控制栏
const openControl = () =>
  controlRef.value ? controlRef.value.openControl() : '';
function destroy() {
  if (player.value) {
    player.value.destroy();
    danmakuRef.value?.stop();
    closeDanmu();
    playerList.value[props.name] = null;
  } else {
    playerList.value[props.name] = null;
  }
}

function refresh() {
  const config = {
    url: props.url,
    type: props.type,
    volume: playerListConfig.value[props.name].volume,
  };
  if (player.value === null) {
    player.value = new Player(videoRef.value!, config);
    player.value.init();
  } else {
    player.value.refresh(config);
  }
}

function updateLiveOrgin() {
  emit('updateLiveOrgin');
}

function biliDanmu(id: number) {
  const { close } = startListen(id, {
    onIncomeDanmu: (msg: any) => danmakuRef.value?.insert(msg.body.content),
  });
  closeDanmu = close;
}

function douyuDanmu(id: string) {
  const danmu = new DouyuDanmu(id, (msg: string) =>
    danmakuRef.value?.insert(msg),
  );
  danmu.connect();
  closeDanmu = () => {
    danmu.ws ? danmu.ws.close() : '';
  };
}

function danmuStart() {
  if (playerList.value[props.name] === null) return;
  const item = playerList.value[props.name];
  if (item === null) return;
  closeDanmu();
  switch (playerList.value[props.name]?.platform) {
    case Platform.Bili:
      biliDanmu(Number(item.realId));
      break;
    case Platform.Douyu:
      douyuDanmu(item.realId);
      break;
  }
}

function modifyVolume(val: number) {
  if (player.value === null) return;
  player.value.modifyVolume(val);
  playerListConfig.value[props.name].volume = val;
}

const qualityChange = (item: QualityType) => emit('qualityChange', item);
const lineChange = (item: LineType) => emit('lineChange', item);

onMounted(() => {
  // 关闭控制栏
  onClickOutside(danmakuWrapRef, () => controlRef.value!.closeControl(), {
    ignore: [...controlRef.value!.getIgnore()],
  });
  setTimeout(() => danmakuRef.value?.resize(), 0);
});

// 自动切换配置
watch(
  (): [string, ConfigType] => [props.url, props.type],
  (val) => {
    if (val[0] !== '') {
      refresh();
      danmuStart();
    }
  },
);

// UPDATE 需要优化播放器移动后的清空逻辑 OR rewrite这个更新逻辑
watch(
  () => playerList.value[props.name],
  (val) => {
    if (val === null) {
      player.value ? player.value.destroy() : '';
      closeDanmu();
    }
  },
);

watch(layoutIndex, () => {
  danmakuRef.value?.resize();
});

const debouncedFn = useDebounceFn(() => {
  danmakuRef.value?.resize();
}, 1000);

window.addEventListener('resize', debouncedFn);

// 暴露函数
defineExpose({
  updateLiveOrgin,
  destroy,
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
  background: rgb(0, 0, 0);
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
