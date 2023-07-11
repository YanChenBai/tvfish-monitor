<template>
  <div
    class="live-wrap"
    :style="{
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
      :style="{ 'grid-area': getPlayerCode(key) }"
    >
      <PlayerWrap
        :title="``"
        :type="type"
        :url="url"
        :name="getPlayerCode(key)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayerWrap from '@/components/playerWrap.vue';
import layout, { getPlayerCode } from '@/hooks/layout';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { ref } from 'vue';

defineOptions({ name: 'index' });
const type = ref(null),
  url = ref('');
const { layoutIndex } = storeToRefs(usePlayerStore());
</script>

<style scoped>
.live-wrap {
  display: grid;
  height: calc(100vh - 40px);
  width: 100%;
}
.live-item {
  height: 100%;
  width: 100%;
  background: #111111;
  box-sizing: border-box;
  border: 1px solid #262626;
}
</style>
