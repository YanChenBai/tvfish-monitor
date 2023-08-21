<template>
  <div
    class="layout-wrap"
    :style="{ height: navState ? ' calc(100vh - 38px)' : ' calc(100vh)' }"
  >
    <div
      class="layout-item"
      v-for="(item, key) in jointLayouts[layoutIndex]"
      :key="`${item.x}_${item.y}`"
      :style="{
        left: `${size * item.x}%`,
        top: `${size * item.y}%`,
        width: `${size * item.w}%`,
        height: `${size * item.h}%`,
      }"
    >
      <PlayerWrap :playerId="key" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayerWrap from '@/components/player/wrap.vue';
import layouts from '@/config/layouts';
import { storeToRefs } from 'pinia';
import { usePlayerStore } from '@/stores/playerStore';
import { computed } from 'vue';

defineOptions({ name: 'LayoutWrap' });

const size = 100 / 12;
const playerStore = usePlayerStore();
const { layoutIndex, navState, configLayout } = storeToRefs(playerStore);
const jointLayouts = computed(() => [...layouts, ...configLayout.value]);
</script>

<style scoped>
.layout-item {
  background: #111111;
  box-shadow: 0 0 0 1px inset #262626;
  padding: 1px;
  box-sizing: border-box;
  overflow: hidden;
  position: absolute;
}

.layout-wrap {
  width: 100vw;
  transition: all 0.1s;
  position: relative;
}
</style>
