<template>
  <PlayerPopover>
    <template #target>
      <slot name="target"></slot>
    </template>
    <template v-if="list.length === 0">
      <div class="player-popover-item">空</div>
    </template>
    <template v-else>
      <div class="player-popover-item" v-for="item in list">
        {{ item.name }}
      </div>
    </template>
  </PlayerPopover>
</template>

<script setup lang="ts">
import PlayerPopover from './popover.vue';
defineOptions({ name: 'PopoverSelect' });
import { QualityType, LineType } from '@/types/player';
withDefaults(defineProps<{ list: LineType[] | QualityType[] }>(), {
  list: Array,
});
</script>

<style scoped>
.player-popover-item {
  padding: 2px 4px;
  box-sizing: border-box;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.player-popover-item:hover {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
