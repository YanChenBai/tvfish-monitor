<template>
  <div :ref="(node: any) => drag(drop(node))" style="width: 100%; height: 100%">
    <LiveDanmuPlayer
      :playerName="playerName"
      :lines="lines"
      :qualitys="qualitys"
      @qualityChange="qualityChange"
      @lineChange="lineChange"
      @refresh="update"
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

defineOptions({ name: 'playerWrap' });

const { playerList, playerListConfig, roomList } = storeToRefs(
  usePlayerStore(),
);

const props = defineProps<{
  playerName: string;
}>();

const playerRef = ref<InstanceType<typeof LiveDanmuPlayer>>(),
  url = ref<string | null>(null),
  qualitys = ref<QualityType[]>([]),
  quality = ref<number | null>(null),
  lines = ref<LineType[]>([]),
  line = ref<string | null>(null);

const player = computed(() => playerList.value[props.playerName]);

// 创建拖拽
const [, drag] = useDrag({
  type: DropType.PlayerDrap,
  item: {
    type: DropType.PlayerDrap,
    name: props.playerName,
  },
});

// 创建拖拽放置
const [, drop] = useDrop({
  accept: [DropType.MenuItem, DropType.PlayerDrap],
  drop: (item: { type: DropType; info: RoomListItem; name: string }) => {
    if (item.type === DropType.MenuItem) {
      playerList.value[props.playerName] = item.info;
    } else if (item.type === DropType.PlayerDrap) {
      if (item.name === props.playerName) return;
      const tmp = playerList.value[props.playerName];
      if (tmp === null) {
        playerList.value[props.playerName] = playerList.value[item.name];
        playerList.value[item.name] = null;
      } else {
        playerList.value[props.playerName] = playerList.value[item.name];
        playerList.value[item.name] = tmp;
      }
    }
    // getOrgin(item.info.roomId, item.info.platform);
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

function updateRoomInfo(info: RoomListItem) {
  const findIndex = roomList.value.findIndex(
    (item) => info.roomId === item.roomId && info.platform === item.platform,
  );
  if (findIndex !== -1) {
    if (info.platform === Platform.Bili) {
      info.face = IMAGE_PROXY + info.face;
      info.keyframe = IMAGE_PROXY + info.keyframe;
    }
    roomList.value[findIndex] = info;
  }
}

// 更新数据
async function update() {
  if (player.value !== null) {
    const res: any = await getOrgin(player.value.roomId, player.value.platform);
    try {
      if (res.code === -5) {
        url.value = null;
        updateRoomInfo(res.data);
      } else {
        qualitys.value = res.data.quality;
        lines.value = res.data.lines;
        const type =
          player.value.platform === Platform.Bili
            ? ConfigType.Hls
            : ConfigType.Flv;
        updateRoomInfo(res.data.info);
        playerRef.value!.refreshPlayer(
          res.data.url,
          playerListConfig.value[props.playerName].volume / 100,
          type,
        );
      }
    } catch (error) {
      error;
    }
  } else {
    playerRef.value!.destroy();
  }
}

onMounted(() => update());
watch(
  () => playerList.value[props.playerName],
  () => {
    update();
  },
);
</script>

<style scoped></style>
