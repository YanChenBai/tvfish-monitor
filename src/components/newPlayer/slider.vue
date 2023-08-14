<template>
  <div @click="popoverOpen = true" class="target">
    <slot name="target"></slot>
  </div>

  <ion-popover :is-open="popoverOpen" @didDismiss="popoverOpen = false">
    <ion-content class="ion-padding">
      {{ `音量控制   ${playerListConfig[playerName].volume}` }}
      <ion-range
        @ionChange="onIonChange"
        :value="playerListConfig[playerName].volume"
      ></ion-range>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import { IonPopover, IonContent, IonRange } from '@ionic/vue';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

defineOptions({ name: 'PlayerSlider' });

const { playerListConfig } = storeToRefs(usePlayerStore());
const props = defineProps<{
  playerName: string;
}>();
const emit = defineEmits(['change']);

const popoverOpen = ref(false);

function onIonChange({ detail }: CustomEvent) {
  playerListConfig.value[props.playerName].volume = detail.value;
  emit('change', detail.value);
}
</script>

<style scoped>
.target {
  display: inline;
}
</style>
