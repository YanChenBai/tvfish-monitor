<template>
  <div class="item-wrap">
    <div class="face">
      <img :src="info.face" />
    </div>
    <div class="info">
      <div class="name">{{ info.name }}</div>
      <div class="title">{{ info.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type RoomListItem } from '@/stores/playerStore';
defineOptions({ name: 'MenuItem' });
defineProps<{
  info: RoomListItem;
}>();
</script>

<style scoped>
.item-wrap {
  display: flex;
  height: 60px;
  width: 100%;
  background: rgb(39, 39, 39);
  border-radius: 4px;
}
.face {
  width: 50px;
}

.info {
  width: 130px;
}
</style>
