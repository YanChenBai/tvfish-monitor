<template>
  <div
    class="live-wrap"
    :style="{
      height: navState ? ' calc(100vh - 38px)' : ' calc(100vh)',
      'grid-template-areas': layout[layoutIndex].area,
      'grid-template-columns': `repeat(${layout[layoutIndex].col}, ${
        100 / layout[layoutIndex].col
      }%)`,
      'grid-template-rows': `repeat(${layout[layoutIndex].row}, ${
        100 / layout[layoutIndex].row
      }%)`,
    }"
  >
    <div
      class="live-item"
      v-for="(_index, key) in layout[layoutIndex].num"
      :key="'player' + key"
      :style="{ 'grid-area': getPlayerCode(key) }"
    >
      <PlayerWrap :type="type" :url="url" :playerName="getPlayerCode(key)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayerWrap from '@/components/playerWrap.vue';
import layout, { getPlayerCode } from '@/hooks/layout';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { ref } from 'vue';

defineOptions({ name: 'LayoutWrap' });
const type = ref(null),
  url = ref('');
const { layoutIndex, navState } = storeToRefs(usePlayerStore());
</script>

<style scoped>
.live-wrap {
  display: grid;
  width: 100%;
  transition: all 0.1s;
}
.live-item {
  height: 100%;
  width: 100%;
  background: #111111;
  box-sizing: border-box;
  border: 1px solid #262626;
}
</style>
