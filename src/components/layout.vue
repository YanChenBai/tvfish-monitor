<template>
  <div
    class="layout-wrap"
    :style="{ height: navState ? ' calc(100vh - 38px)' : ' calc(100vh)' }"
  >
    <div
      class="layout-item"
      v-for="(item, key) in jointLayouts[layoutIndex]"
      :key="key"
      :style="getBorder(item)"
    >
      <PlayerWrap :playerId="key" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PlayerWrap from '@/components/player/wrap.vue';
import layouts from '@/config/layouts';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/stores/config';
import { StyleValue, computed } from 'vue';
import type { Layout, LayoutList } from '@/types/player';

defineOptions({ name: 'LayoutWrap' });

const size = 100 / 12;
const playerStore = useConfigStore();
const { layoutIndex, navState, configLayout } = storeToRefs(playerStore);
const jointLayouts = computed<LayoutList>(() => [
  ...layouts,
  ...configLayout.value,
]);

const getBorderValue = (show: boolean) => (show ? '#262626' : 'rgba(0,0,0,0)');

function getBorder(item: Layout): StyleValue {
  return {
    left: `${size * item.x}%`,
    top: `${size * item.y}%`,
    width: `${size * item.w}%`,
    height: `${size * item.h}%`,
    borderLeftColor: getBorderValue(true),
    borderRightColor: getBorderValue(item.x + item.w === 12 ? true : false),
    borderTopColor: getBorderValue(true),
    borderBottomColor: getBorderValue(item.y + item.h === 12 ? true : false),
  };
}
</script>

<style scoped>
.layout-item {
  background: #111111;
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  overflow: hidden;
  position: absolute;
}

.layout-wrap {
  width: 100vw;
  transition: all 0.1s;
  position: relative;
}
</style>
@/stores/config
