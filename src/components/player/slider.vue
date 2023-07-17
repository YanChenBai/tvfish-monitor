<template>
  <PlayerPopover width="100px">
    <template #target>
      <slot name="target"></slot>
    </template>
    <div class="wrap">
      <vue-slider
        @change="change"
        v-model="volume"
        direction="btt"
        :height="200"
        tooltip="none"
      ></vue-slider>
    </div>
  </PlayerPopover>
</template>

<script setup lang="ts">
import VueSlider from 'vue-slider-component';
import PlayerPopover from './popover.vue';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

defineOptions({ name: 'PlayerSlider' });

const { playerListConfig } = storeToRefs(usePlayerStore());
const props = defineProps<{
  playerName: string;
}>();
const emit = defineEmits(['change']);

const volume = ref(playerListConfig.value[props.playerName].volume);

const change = (val: number) => {
  volume.value = val * 100;
  playerListConfig.value[props.playerName].volume = val;
  emit('change', val);
};
</script>

<style scoped>
.target {
  display: inline-flex;
  align-items: center;
}
.wrap {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
