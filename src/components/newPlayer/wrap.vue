<template>
  <div :ref="(node: any) => drag(drop(node))" style="width: 100%; height: 100%">
    <Player></Player>
  </div>
</template>

<script setup lang="ts">
import Player from './player.vue';
import { useDrag, useDrop } from 'vue3-dnd';
import { computed, onMounted, provide, reactive } from 'vue';
import { playerWrapProvide, repoProvides } from '@/utils/provides';
import { getBiliOrgin, getDouyuOrgin } from '@/api/getOrgin';
import { Platform, RoomListItem, RoomStatus } from '@/types/player';
import {
  ConfigType,
  DragType,
  DragTypeItem,
  LiveConfig,
} from '@/types/playerNew';
import injectStrict from '@/utils/injectStrict';
defineOptions({ name: 'PlayerWrap' });

const props = defineProps<{
  playerId: number;
}>();

const liveConfig = reactive<LiveConfig>({
  line: null,
  lines: [],
  quality: null,
  qualitys: [],
  type: ConfigType.Flv,
  url: '',
});

const { playerRepo } = injectStrict(repoProvides);

// 初始化播放器, 没有的话进行一个注的册
if (playerRepo.where('id', props.playerId).first() === null) {
  playerRepo.save({ id: props.playerId });
}

const playerConfig = computed(
  () => playerRepo.with('room').where('id', props.playerId).first()!,
);

// 创建拖拽放置
const [, drop] = useDrop({
  accept: [DragType.CARD_DRAG, DragType.PLAYER_DRAG],
  drop: (item: DragTypeItem) => {
    if (item.type === DragType.CARD_DRAG) {
      // 当卡片放置时更新 roomTypeId
      playerRepo.where('id', playerConfig.value.id).update({
        roomTypeId: item.roomTypeId,
      });
    } else if (item.type === DragType.PLAYER_DRAG) {
      // 放置的目标是自己的话排除
      if (item.playerId === playerConfig.value.id) return;

      // 交换 roomTypeId
      playerRepo
        .where('id', item.playerId)
        .update({ roomTypeId: playerConfig.value.roomTypeId });
      playerRepo
        .where('id', playerConfig.value.id)
        .update({ roomTypeId: item.roomTypeId });
    }
  },
  collect(monitor) {
    if (monitor.isOver()) {
      // console.log(monitor.isOver());
    }
  },
});

// 创建拖拽
let dragLock = true;
const [, drag] = useDrag({
  type: DragType.PLAYER_DRAG,
  item: {
    playerId: playerConfig.value.id,
    roomTypeId: playerConfig.value.roomTypeId,
    type: DragType.PLAYER_DRAG,
  } as DragTypeItem,
  collect(monitor) {
    if (dragLock && monitor.isDragging()) {
      dragLock = false;
    }
  },
  end: () => {
    dragLock = true;
  },
});

// 获取直播源
async function getOrgin(roomId: number, type: Platform) {
  // getBiliOrgin, getDouyuOrgin
  let res;
  switch (type) {
    case Platform.Douyu:
      res = await getDouyuOrgin(roomId, liveConfig.quality, liveConfig.line);
      break;
    case Platform.Bili:
      res = await getBiliOrgin(roomId, liveConfig.quality, liveConfig.line);
      break;
  }
  return res;
}

// 更新数据
async function update(): Promise<boolean> {
  if (playerConfig.value.room) {
    try {
      const res: any = await getOrgin(
        playerConfig.value.room.roomId,
        playerConfig.value.room.platform,
      );
      if (res.code === -5) {
        return false;
      } else {
        const info: RoomListItem = res.data.info;
        if (info.status === RoomStatus.LIVE) {
          const { quality, lines, qn, line, url } = res.data;
          liveConfig.qualitys = quality;
          liveConfig.lines = lines;
          liveConfig.quality = qn;
          liveConfig.line = line;
          liveConfig.type =
            playerConfig.value.room.platform === Platform.Bili
              ? ConfigType.Hls
              : ConfigType.Flv;
          liveConfig.url = url;
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
}

onMounted(() => {
  if (playerConfig.value) update();
});

// 依赖注入
provide(playerWrapProvide, { playerConfig, liveConfig });
</script>

<style scoped></style>
