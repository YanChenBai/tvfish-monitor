<template>
  <div class="live-danmu-player">
    <VueDanmuKu
      :playerName="playerName"
      ref="danmakuRef"
      @click="openControl()"
      @live-end="refresh(true)"
      @live-start="refresh(true)"
      @titleChange="titleChange"
    />
    <div class="video-wrap">
      <video ref="videoRef" autoplay v-show="showPlayer"></video>
    </div>
    <Control
      @refresh="refresh"
      @destroy="destroy"
      @volume-change="modifyVolume"
      @qualityChange="qualityChange"
      @lineChange="lineChange"
      ref="controlRef"
      :key="`player-${playerName}`"
      :playerName="playerName"
      :status="roomInfo.status"
      :title="roomInfo.title"
      :lines="lines"
      :qualitys="qualitys"
    />
  </div>
</template>

<script setup lang="ts">
import VueDanmuKu from './danmu.vue';
import { computed, onMounted, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import Control from '@/components/player/control.vue';
import { ConfigType } from '@/hooks/player';
import Player from '@/hooks/player';
import { QualityType, LineType, Platform, RoomStatus } from '@/types/player';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'LiveDanmuPlayer' });

const props = defineProps<{
  lines: LineType[];
  qualitys: QualityType[];
  playerName: string;
}>();

const emit = defineEmits([
  'qualityChange', // 清晰切换
  'lineChange', // 线路切换
  'refresh', // 刷新
  'titleChange', // 标题刷新
]);
const defConfig = {
  type: ConfigType.Flv,
  title: '',
  status: RoomStatus.CLOSE,
};
const { playerList, roomList } = storeToRefs(usePlayerStore());
const playerStore = computed(() => playerList.value[props.playerName]);
const roomInfo = computed(() => {
  if (playerStore.value !== null) {
    const room = roomList.value.find(
      (item) =>
        item.platform === playerStore.value?.platform &&
        item.roomId === playerStore.value?.roomId,
    );
    return room === undefined
      ? defConfig
      : {
          ...room,
          type:
            room.platform === Platform.Bili ? ConfigType.Hls : ConfigType.Flv,
        };
  } else {
    return defConfig;
  }
});

const player = ref<Player | null>(null),
  danmakuRef = ref(),
  controlRef = ref<InstanceType<typeof Control>>(),
  videoRef = ref<HTMLMediaElement>();

// sysMessage 开播了是否发送系统通知
const refresh = (sysMessage = false) => emit('refresh', sysMessage);
// 打开控制栏
const openControl = () =>
  controlRef.value ? controlRef.value.openControl() : '';
// 刷新标题
const titleChange = (title: string) => emit('titleChange', title);
// 销毁播放器
function destroy(clear = true) {
  if (player.value) {
    player.value.destroy();
    if (clear) playerList.value[props.playerName] = null;
  }
}

// 刷新播放器
function refreshPlayer(
  url: string,
  volume = 0,
  type: ConfigType = ConfigType.Flv,
) {
  const config = { url, type, volume };
  if (player.value === null) {
    player.value = new Player(videoRef.value!, config);
    player.value.init();
  } else {
    player.value.refresh(config);
  }
}

// 更新音量
function modifyVolume(val: number) {
  if (player.value === null) return;
  player.value.modifyVolume(val / 100);
}

// 清晰度和线路切换
const qualityChange = (item: QualityType) => emit('qualityChange', item);
const lineChange = (item: LineType) => emit('lineChange', item);

const showPlayer = computed(() => {
  if (player.value === null) return false;
  if (
    roomInfo.value.status === RoomStatus.CLOSE ||
    roomInfo.value.status === RoomStatus.REC
  )
    return false;
  return true;
});

onMounted(() => {
  // 关闭控制栏
  onClickOutside(danmakuRef, () => controlRef.value!.closeControl(), {
    ignore: [...controlRef.value!.getIgnore()],
  });
});

// 暴露函数
defineExpose({
  destroy,
  refreshPlayer,
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
.status-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 16px;
}
.status-text span {
  border-radius: 4px;
  opacity: 0;
}
</style>
