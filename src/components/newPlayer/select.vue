<template>
  <div @click="popoverOpen = true" class="target">
    <slot name="target"></slot>
  </div>

  <ion-popover
    :is-open="popoverOpen"
    trigger="click-trigger"
    trigger-action="click"
    @didDismiss="popoverOpen = false"
  >
    <ion-content>
      <div class="wrap">
        <template v-if="list.length === 0">
          <div class="player-popover-item">空</div>
        </template>
        <template v-else>
          <ion-button
            expand="block"
            color="medium"
            fill="clear"
            v-for="item in list"
            :key="item.name"
            @click="selectOption(item)"
          >
            {{ item.name }}
          </ion-button>
        </template>
      </div>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPopover, IonContent, IonButton } from '@ionic/vue';

defineOptions({ name: 'PopoverSelect' });

import { QualityType, LineType } from '@/types/player';
withDefaults(defineProps<{ list: LineType[] | QualityType[] }>(), {
  list: Array,
});
const emit = defineEmits(['change']);
const popoverOpen = ref(false);
function selectOption(val: any) {
  emit('change', val);
}
</script>

<style scoped>
.player-popover-item {
  padding: 10px 10px;
  box-sizing: border-box;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 2px;
}

.player-popover-item:hover {
  background-color: rgba(0, 0, 0, 0.4);
}
.wrap {
  padding: 20px;
}
.target {
  display: inline;
}
</style>
