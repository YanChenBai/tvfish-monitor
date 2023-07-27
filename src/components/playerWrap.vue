<template>
  <div :ref="(node: any) => drag(drop(node))" style="width: 100%; height: 100%">
    <LiveDanmuPlayer
      :playerName="playerName"
      :lines="lines"
      :qualitys="qualitys"
      :currentQuality="currentQuality"
      :currentLine="currentLine"
      @qualityChange="qualityChange"
      @lineChange="lineChange"
      @refresh="update"
      @titleChange="titleChange"
      @anomaly="anomaly"
      ref="playerRef"
      :key="`playerWrap-${playerName}`"
    />
  </div>
</template>

<script setup lang="ts">
import LiveDanmuPlayer from '@/components/player/player.vue';
import { ConfigType } from '@/hooks/player';
import { useDrag, useDrop } from 'vue3-dnd';
import { DropType } from '@/types/drop';
import { usePlayerStore } from '@/stores/playerStore';
import { QualityType, LineType, RoomListItem, Platform } from '@/types/player';
import { computed, onMounted, ref, watch } from 'vue';
import { getBiliOrgin, getDouyuOrgin } from '@/api/getOrgin';
import { storeToRefs } from 'pinia';
import { IMAGE_PROXY } from '@/config/proxy';
import { impactHeavy, vibrate } from '@/utils/impact';
import { notification } from '@/hooks/notification';

defineOptions({ name: 'playerWrap' });

const playerStore = usePlayerStore();
const { playerList, playerListConfig, roomList } = storeToRefs(playerStore);

const props = defineProps<{
  playerName: string;
}>();

const playerRef = ref<InstanceType<typeof LiveDanmuPlayer>>(),
  url = ref<string | null>(null),
  qualitys = ref<QualityType[]>([]),
  quality = ref<number | null>(null),
  lines = ref<LineType[]>([]),
  line = ref<string | null>(null),
  currentQuality = ref<number | null>(null),
  currentLine = ref<any>(null);

const player = computed(() => playerList.value[props.playerName]);

// 创建拖拽
let dragLock = true;
const [, drag] = useDrag({
  type: DropType.PlayerDrap,
  item: {
    type: DropType.PlayerDrap,
    name: props.playerName,
  },
  collect(monitor) {
    if (dragLock && monitor.isDragging()) {
      dragLock = false;
      impactHeavy();
    }
  },
  end: () => {
    dragLock = true;
  },
});

// 创建拖拽放置
const [, drop] = useDrop({
  accept: [DropType.MenuItem, DropType.PlayerDrap],
  drop: (item: { type: DropType; info: RoomListItem; name: string }) => {
    if (item.type === DropType.MenuItem) {
      // console.log(item.info);

      playerList.value[props.playerName] = {
        platform: item.info.platform,
        roomId: item.info.roomId,
      };
      vibrate(15);
    } else if (item.type === DropType.PlayerDrap) {
      if (item.name === props.playerName) return;
      vibrate(15);
      const tmp = playerList.value[props.playerName];
      if (tmp === null) {
        playerList.value[props.playerName] = playerList.value[item.name];
        playerList.value[item.name] = null;
      } else {
        playerList.value[props.playerName] = playerList.value[item.name];
        playerList.value[item.name] = tmp;
      }
    }
  },
  collect(monitor) {
    if (monitor.isOver()) {
      // console.log(monitor.isOver());
    }
  },
});

const qualityChange = (item: QualityType) => {
  quality.value = item.qn;
  update();
};
const lineChange = (item: LineType) => {
  line.value = item.line;
  update();
};

// 获取直播源
async function getOrgin(roomId: number, type: Platform) {
  // getBiliOrgin, getDouyuOrgin
  let res;
  switch (type) {
    case Platform.Douyu:
      res = await getDouyuOrgin(roomId, quality.value, line.value);
      break;
    case Platform.Bili:
      res = await getBiliOrgin(roomId, quality.value, line.value);
      break;
  }
  return res;
}

const fundRoomIndex = (roomId: number, platform: Platform) =>
  roomList.value.findIndex(
    (item) => roomId === item.roomId && platform === item.platform,
  );

function titleChange(title: string) {
  if (player.value) {
    const findIndex = fundRoomIndex(player.value.roomId, player.value.platform);
    roomList.value[findIndex].title = title;
  }
}

function updateRoomInfo(info: RoomListItem) {
  const findIndex = fundRoomIndex(info.roomId, info.platform);
  if (findIndex !== -1) {
    if (info.platform === Platform.Bili) {
      info.face = IMAGE_PROXY + info.face;
      info.keyframe = IMAGE_PROXY + info.keyframe;
    }
    const tmp = { ...roomList.value[findIndex] };
    roomList.value[findIndex] = info;
    return tmp;
  }
}

// 更新数据
async function update(sysMessage = false): Promise<RoomListItem | false> {
  if (player.value !== null) {
    const res: any = await getOrgin(player.value.roomId, player.value.platform);
    try {
      if (res.code === -5) {
        url.value = null;
        updateRoomInfo(res.data);
        playerRef.value!.destroy(false);
        return res.data;
      } else {
        qualitys.value = res.data.quality;
        lines.value = res.data.lines;
        currentQuality.value = res.data.qn;
        currentLine.value = res.data.line;
        const type =
          player.value.platform === Platform.Bili
            ? ConfigType.Hls
            : ConfigType.Flv;
        const info: RoomListItem = res.data.info;
        const oldData = updateRoomInfo(info);
        playerRef.value!.refreshPlayer(
          res.data.url,
          playerListConfig.value[props.playerName].volume / 100,
          type,
        );
        if (sysMessage) {
          // 避免重复开播提醒
          if (oldData !== undefined && oldData.status !== info.status) {
            await notification(`${info.name} - 开播啦!`, info.title);
          }
        }
        return info;
      }
    } catch (error) {
      return false;
    }
  } else {
    playerRef.value!.destroy();
    return false;
  }
}

async function anomaly() {
  update();
}

onMounted(() => update());
watch(
  () => playerList.value[props.playerName],
  () => update(),
);
</script>

<style scoped></style>
