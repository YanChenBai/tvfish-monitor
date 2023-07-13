<template>
  <div :ref="(node: any) => drag(drop(node))" style="width: 100%; height: 100%">
    <LiveDanmuPlayer
      :title="title"
      :url="url"
      :type="type"
      :name="name"
      :lines="lines"
      :qualitys="qualitys"
      @qualityChange="qualityChange"
      @lineChange="lineChange"
      @updateLiveOrgin="updateLiveOrgin"
      ref="player"
    />
  </div>
</template>

<script setup lang="ts">
import LiveDanmuPlayer from '@/components/player/player.vue';
import { ConfigType } from '@/hooks/player';
import { useDrag, useDrop } from 'vue3-dnd';
import { DropType } from '@/types/drop';
import { RoomListItem, usePlayerStore } from '@/stores/playerStore';
import { QualityType, LineType } from '@/types/player';
import { Platform } from '@/stores/playerStore';
import { computed, onMounted, ref, watch } from 'vue';
import { getBiliOrgin, getDouyuOrgin } from '@/api/getOrgin';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'playerWrap' });

const { playerList, playerListConfig } = storeToRefs(usePlayerStore());

const props = defineProps<{
  name: string;
}>();

const getPlayerParams = computed<RoomListItem>(() => {
  return (playerList.value as any)[props.name];
});
const title = ref(getPlayerParams.value ? getPlayerParams.value.title : ''),
  player = ref<InstanceType<typeof LiveDanmuPlayer>>(),
  url = ref(''),
  type = ref(ConfigType.Flv),
  qualitys = ref<QualityType[]>([]),
  lines = ref<LineType[]>([]),
  quality = ref<number | null>(null),
  line = ref<string | null | number>(null);

// 创建拖拽
const [, drag] = useDrag({
  type: DropType.PlayerDrap,
  item: {
    type: DropType.PlayerDrap,
    name: props.name,
  },
});

// 创建拖拽放置
const [, drop] = useDrop({
  accept: [DropType.MenuItem, DropType.PlayerDrap],
  drop: (item: { type: DropType; info: RoomListItem; name: string }) => {
    if (item.type === DropType.MenuItem) {
      playerList.value[props.name] = item.info;
    } else if (item.type === DropType.PlayerDrap) {
      if (item.name === props.name) return;
      const tmp = playerList.value[props.name];
      if (tmp === null) {
        playerList.value[props.name] = playerList.value[item.name];
        playerList.value[item.name] = null;
      } else {
        playerList.value[props.name] = playerList.value[item.name];
        playerList.value[item.name] = tmp;
      }
    }
    // getOrgin(item.info.roomId, item.info.platform);
  },
});

const qualityChange = (item: QualityType) => {
  console.log(item.qn);

  quality.value = item.qn;
};
const lineChange = (item: LineType) => (line.value = item.line);
const updateLiveOrgin = () => update();

// 获取直播源
async function getOrgin(roomId: number, type: Platform) {
  // getBiliOrgin, getDouyuOrgin
  let res;
  switch (type) {
    case Platform.Douyu:
      res = await getDouyuOrgin(roomId, quality.value, line.value as string);
      break;
    case Platform.Bili:
      res = await getBiliOrgin(roomId, quality.value, line.value as number);
      break;
  }
  return res;
}

// 更新数据
async function update() {
  if (getPlayerParams.value !== null) {
    const res: any = await getOrgin(
      getPlayerParams.value.roomId,
      getPlayerParams.value.platform,
    );

    if (res.code === -5) {
      title.value = res.data.title;
      url.value = '';
      player.value?.destroy();
    } else {
      title.value = res.data.info.title;
      url.value = res.data.url;
      type.value =
        getPlayerParams.value.platform === Platform.Bili
          ? ConfigType.Hls
          : ConfigType.Flv;
      qualitys.value = res.data.quality;
      lines.value = res.data.lines;
    }
  }
}

onMounted(async () => {
  await update();
  player.value!.modifyVolume(playerListConfig.value[props.name].volume);
});

// 自动更新
watch(
  () => [getPlayerParams.value, quality.value, line.value],
  async () => {
    update();
  },
);
</script>

<style scoped lang="scss"></style>
