<template>
  <div :ref="(node: any) => drag(drop(node))" style="width: 100%; height: 100%">
    <LiveDanmuPlayer
      :title="title"
      :url="url"
      :type="type"
      :name="name"
      :lines="[]"
      :qualitys="[]"
    />
  </div>
</template>

<script setup lang="ts">
import LiveDanmuPlayer from '@/components/player/player.vue';
import layout, { getPlayerCode } from '@/hooks/layout';
import { ConfigType } from '@/hooks/player';
import { useDrag, useDrop } from 'vue3-dnd';
import { DropType } from '@/types/drop';
import { RoomListItem, usePlayerStore } from '@/stores/playerStore';
import { QualityType, LineType } from '@/types/player';
import { Platform } from '@/stores/playerStore';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { getBiliOrgin, getDouyuOrgin } from '@/api/getOrgin';
import { storeToRefs } from 'pinia';

defineOptions({ name: 'playerWrap' });

const { playerList } = storeToRefs(usePlayerStore());

const props = defineProps<{
  name: string;
}>();

const getPlayerParams = computed<RoomListItem>(() => {
  return (playerList.value as any)[props.name];
});

const title = ref(getPlayerParams.value ? getPlayerParams.value.title : ''),
  url = ref(''),
  type = ref(ConfigType.Flv);

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
      (playerList.value as any)[props.name] = item.info;
    } else if (item.type === DropType.PlayerDrap) {
      console.log(item.name);
    }
    // getOrgin(item.info.roomId, item.info.platform);
  },
});

async function getOrgin(roomId: number, type: Platform) {
  // getBiliOrgin, getDouyuOrgin
  let res;
  switch (type) {
    case Platform.Douyu:
      res = await getDouyuOrgin(roomId, null, null);
      break;
    case Platform.Bili:
      res = await getBiliOrgin(roomId, null, null);
      break;
  }
  return res;
}

async function update() {
  if (getPlayerParams.value !== null) {
    const res: any = await getOrgin(
      getPlayerParams.value.roomId,
      getPlayerParams.value.platform,
    );

    if (res.code === -5) {
      title.value = res.data.title;
    } else {
      title.value = res.data.info.title;
      url.value = res.data.url;
      type.value =
        getPlayerParams.value.platform === Platform.Bili
          ? ConfigType.Hls
          : ConfigType.Flv;
      console.log(type.value);
    }
  }
}

onMounted(() => {
  update();
});

watch(getPlayerParams, async (val) => {
  update();
});
</script>

<style scoped lang="scss"></style>
