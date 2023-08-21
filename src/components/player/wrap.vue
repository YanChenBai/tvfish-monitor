<template>
  <div :ref="(node: any) => drag(drop(node))" style="width: 100%; height: 100%">
    <Player ref="playerRef"></Player>
  </div>
</template>

<script setup lang="ts">
import Player from './player.vue';
import { useDrag, useDrop } from 'vue3-dnd';
import { computed, onMounted, provide, reactive, watch } from 'vue';
import { playerWrapProvides, repoProvides } from '@/utils/provides';
import { getBiliOrgin, getDouyuOrgin } from '@/api/getOrgin';
import { Platform, RoomStatus } from '@/types/playerNew';
import {
  ConfigType,
  DragType,
  DragTypeItem,
  LiveConfig,
} from '@/types/playerNew';
import injectStrict from '@/utils/injectStrict';
import { templateRef } from '@vueuse/core';
import { updateAttr } from '@/utils/updateAttr';
import { vibrate } from '@/utils/impact';

defineOptions({ name: 'PlayerWrap' });

const props = defineProps<{
  playerId: number;
}>();
const playerRef = templateRef<InstanceType<typeof Player>>('playerRef');
const defLiveConfig = {
  type: ConfigType.Flv,
  qualitys: [],
  lines: [],
  line: null,
  quality: null,
  url: '',
};
const liveConfig = reactive<LiveConfig>({ ...defLiveConfig });
const { playerRepo, roomRepo } = injectStrict(repoProvides);

// 初始化播放器, 没有的话进行一个注的册
if (playerRepo.where('id', props.playerId).first() === null) {
  playerRepo.save({ id: props.playerId });
}

const playerConfig = computed(
  () => playerRepo.with('room').where('id', props.playerId).first()!,
);

// 清空播放配置
function clearLiveConfig() {
  updateAttr(liveConfig, defLiveConfig);
}

// 创建拖拽放置
const [, drop] = useDrop({
  accept: [DragType.CARD_DRAG, DragType.PLAYER_DRAG],
  drop: async (item: DragTypeItem) => {
    if (item.type === DragType.CARD_DRAG) {
      // 排除是同一个直播间的情况
      if (item.roomTypeId === playerConfig.value.roomTypeId) return;
      // 当卡片放置时更新 roomTypeId
      playerRepo.save({
        id: props.playerId,
        roomTypeId: item.roomTypeId,
      });
      // 先销毁原先的播放器
      playerRef.value.destroy();
      // 情况原有配置
      clearLiveConfig();
      update();
      vibrate(15);
    } else if (item.type === DragType.PLAYER_DRAG) {
      // 放置的目标是自己的话排除
      const { roomTypeId, id } = item.playerConfig.value;
      if (roomTypeId === playerConfig.value.roomTypeId) return;

      // 交换 roomTypeId
      playerRepo.save([
        {
          id,
          roomTypeId: playerConfig.value.roomTypeId,
        },
        { id: props.playerId, roomTypeId },
      ]);

      // 交换直播配置
      const tmp = { ...item.liveConfig };
      updateAttr(item.liveConfig, liveConfig);
      updateAttr(liveConfig, tmp);
      vibrate(15);
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
    playerConfig,
    type: DragType.PLAYER_DRAG,
    liveConfig: liveConfig,
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
async function update() {
  if (playerRef.value === undefined) throw new Error('init after onMounted!');
  if (playerConfig.value.room) {
    getOrgin(playerConfig.value.room.roomId, playerConfig.value.room.platform)
      .then((res) => {
        if (res === false) throw new Error('请求异常!');
        else {
          return res;
        }
      })
      .then((res) => {
        // 判断是否开播
        if (res.code === -5) {
          roomRepo
            .where('roomTypeId', playerConfig.value.roomTypeId)
            .update(res.data);
          playerRef.value.destroy();
        } else if (res.code === 200) {
          return res.data;
        } else {
          playerRef.value.destroy();
          throw new Error('请求异常!');
        }
      })
      .then((res) => {
        // 判断开播后是否真的在直播（可能是轮播状态）
        if (res && res.info.status === RoomStatus.LIVE) {
          const { quality, lines, qn, line, url, info } = res;
          updateAttr(liveConfig, {
            lines,
            qualitys: quality,
            line: line,
            quality: qn,
            url,
            type:
              info.platform === Platform.Bili ? ConfigType.Hls : ConfigType.Flv,
          });
          roomRepo
            .where('roomTypeId', playerConfig.value.roomTypeId)
            .update(res.info);
          playerRef.value.refresh();
        } else {
          playerRef.value.destroy();
        }
      });
  } else {
    playerRef.value.destroy();
  }
}

// 初始化
onMounted(() => {
  update();
});

// 房间切换时update
watch(
  () => playerConfig.value.roomTypeId,
  () => {
    playerRef.value.refresh();
  },
);

// 依赖注入
provide(playerWrapProvides, {
  playerConfig,
  liveConfig,
  update,
  clearLiveConfig,
});
</script>

<style scoped></style>
