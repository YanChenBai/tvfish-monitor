<template>
  <div
    class="item-wrap"
    :ref="drag"
    @click="update(info.realId, info.platform)"
  >
    <div class="face">
      <!-- <div class="tag">{{ info.platform === 'bili' ? 'b站' : '斗鱼' }}</div> -->
      <div
        :class="{ [Number(info.status) === 1 ? 'live' : 'unlive']: true }"
      ></div>
      <img :src="info.face" />
    </div>
    <div class="info">
      <div class="name">
        <n-ellipsis style="max-width: 150px">{{ info.name }}</n-ellipsis>
      </div>
      <div class="title">
        <n-ellipsis style="max-width: 150px">{{ info.title }}</n-ellipsis>
      </div>
      <div class="news">
        <n-ellipsis style="max-width: 150px">公告：{{ info.news }}</n-ellipsis>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NEllipsis } from 'naive-ui';
import {
  usePlayerStore,
  Platform,
  type RoomListItem,
} from '@/stores/playerStore';
import { DropType } from '@/types/drop';
import { useDrag } from 'vue3-dnd';

defineOptions({ name: 'MenuItem' });

const playerStore = usePlayerStore();
const emit = defineEmits(['drag']);
const props = defineProps<{
  info: RoomListItem;
}>();

function update(roomId: string, platform: Platform) {
  playerStore.updateRoomInfo(roomId, platform);
}

// 创建拖拽
const [, drag] = useDrag({
  type: DropType.MenuItem,
  item: {
    type: DropType.MenuItem,
    info: props.info,
  },
  collect: (monitor) => {
    if (monitor.isDragging()) {
      emit('drag', props.info);
    }
  },
});
</script>

<style scoped>
.item-wrap {
  display: flex;
  height: 64px;
  width: 100%;
  background: rgb(56, 56, 56);
  border-radius: 5px;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
}
.face {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  position: relative;
}
.tag {
  position: absolute;
  background-color: #2080f0;
  opacity: 0.5;
  padding: 0px 8px;
  border-radius: 4px;
  left: 2px;
  top: 2px;
}
.face img {
  border-radius: 4px;
  user-select: none;
}

.info {
  width: 160px;
  padding: 0px 10px;
}
.title,
.news {
  color: #bbb9b9;
  font-size: 12px;
}
.name {
  width: calc(100%);
}
.live,
.unlive {
  width: 14px;
  height: 14px;
  position: absolute;
  left: 2px;
  top: 2px;
  border-radius: 7px;
  border: 2px solid #e6e6e6;
}
.live {
  background-color: #ee3a3a;
}
.unlive {
  background-color: #b8b7b7;
}
</style>
