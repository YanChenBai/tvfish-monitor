<template>
  <div :ref="(node: any) => drag(drop(node))" style="width: 100%; height: 100%">
    <Player></Player>
  </div>
</template>

<script setup lang="ts">
import Player from './player.vue';
import { useDrag, useDrop } from 'vue3-dnd';
import { useRepo } from 'pinia-orm';
import PlayerStore from '@/stores/player';
import { computed, onMounted, provide, reactive, watch } from 'vue';
import { playerWrapProvide } from '@/utils/provides';
import { getBiliOrgin, getDouyuOrgin } from '@/api/getOrgin';
import { Platform, RoomListItem, RoomStatus } from '@/types/player';
import { ConfigType } from '@/hooks/usePlayer';
defineOptions({ name: 'PlayerWrap' });

const props = defineProps<{
  playerId: number;
}>();

const liveConfig = reactive({
  line: null,
  lines: [],
  quality: null,
  qualitys: [],
  type: ConfigType.Flv,
  url: '',
});
const userRepo = useRepo(PlayerStore);
const player = computed(() =>
  userRepo.with('room').where('id', props.playerId).first(),
);

// 初始化播放器, 没有的话进行一个注的册
if (userRepo.where('id', props.playerId).first() === null) {
  userRepo.save({ id: props.playerId });
}

// 创建拖拽放置
const [, drop] = useDrop({
  accept: [],
  drop: () => {
    //
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
  type: '',
  item: {},
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
  if (player.value?.room) {
    try {
      const res: any = await getOrgin(
        player.value.room.roomId,
        player.value.room.platform,
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
            player.value.room.platform === Platform.Bili
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
  if (player.value?.room) update();
});

// 依赖注入
provide(playerWrapProvide, { player, config: liveConfig });
</script>

<style scoped></style>
