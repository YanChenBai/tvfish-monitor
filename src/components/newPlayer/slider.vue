<template>
  <div @click="popoverOpen = true" class="target">
    <slot name="target"></slot>
  </div>

  <ion-popover :is-open="popoverOpen" @didDismiss="popoverOpen = false">
    <ion-content class="ion-padding">
      {{ `音量控制   ${playerConfig.volume}` }}
      <ion-range
        @ionChange="onIonChange"
        :value="playerConfig.volume"
      ></ion-range>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import { IonPopover, IonContent, IonRange } from '@ionic/vue';
import { ref } from 'vue';
import injectStrict from '@/utils/injectStrict';
import {
  playerProvide,
  playerWrapProvide,
  repoProvides,
} from '@/utils/provides';

defineOptions({ name: 'PlayerSlider' });
const { playerConfig } = injectStrict(playerWrapProvide);
const { playerRepo } = injectStrict(repoProvides);
const player = injectStrict(playerProvide);
const popoverOpen = ref(false);

function onIonChange({ detail }: CustomEvent) {
  playerRepo
    .where('id', playerConfig.value.id)
    .update({ volume: detail.value });
  if (player.dplayer) player.dplayer.volume(detail.value / 100, false, false);
}
</script>

<style scoped>
.target {
  display: inline;
}
</style>
