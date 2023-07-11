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
      <!-- <LivePlayer
        :name="getPlayerCode(key)"
        :key="`player-${getPlayerCode(key)}`"
      ></LivePlayer> -->
      <LiveDanmuPlayer
        :title="`[]`"
        :type="type"
        :url="url"
        :name="getPlayerCode(key).toLocaleUpperCase()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LiveDanmuPlayer from '@/components/LiveDanmuPlayer/index.vue';
import layout, { getPlayerCode } from './index';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { ref } from 'vue';
import { ConfigType } from '../LiveDanmuPlayer/type';
defineOptions({ name: 'index' });
const type = ref(ConfigType.Flv),
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
