<template>
  <div class="item-wrap" :ref="drag">
    <div class="face">
      <div class="tag">{{ info.platform === 'bili' ? 'b站' : '斗鱼' }}</div>
      <img :src="info.face" />
    </div>
    <div class="info">
      <div class="name">
        <n-ellipsis style="max-width: 180px">{{ info.name }}</n-ellipsis>
      </div>
      <div class="title">
        <n-ellipsis style="max-width: 180px">{{ info.title }}</n-ellipsis>
      </div>
      <div class="news">
        <n-ellipsis style="max-width: 180px">公告：{{ info.news }}</n-ellipsis>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NEllipsis } from 'naive-ui';
import { type RoomListItem } from '@/stores/playerStore';
import { DropType } from '@/types/drop';

defineOptions({ name: 'MenuItem' });

const props = defineProps<{
  info: RoomListItem;
}>();

import { useDrag, useDrop } from 'vue3-dnd';
// 创建拖拽
const [, drag] = useDrag({
  type: DropType.MenuItem,
  item: {
    type: DropType.MenuItem,
    info: props.info,
  },
});
</script>

<style scoped>
.item-wrap {
  display: flex;
  height: 80px;
  width: 100%;
  background: rgb(56, 56, 56);
  border-radius: 4px;
  color: #fff;
}
.face {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  position: relative;
}
.tag {
  position: absolute;
  background-color: #2080f0;
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
  width: 200px;
  padding: 0px 10px;
}
.title,
.news {
  color: #dadada;
  font-size: 14px;
}
</style>
