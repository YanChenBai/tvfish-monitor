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
import { ref, watch } from 'vue';
import injectStrict from '@/utils/injectStrict';
import {
  playerProvides,
  playerWrapProvides,
  repoProvides,
} from '@/utils/provides';

defineOptions({ name: 'PlayerSlider' });
const { playerConfig } = injectStrict(playerWrapProvides);
const { playerRepo } = injectStrict(repoProvides);
const player = injectStrict(playerProvides);
const popoverOpen = ref(false);

function onIonChange({ detail }: CustomEvent) {
  playerRepo
    .where('id', playerConfig.value.id)
    .update({ volume: detail.value });
  player.setVolume(detail.value);
}

// 监听变化, 在统一管理入口处会直接修改对应的音量
watch(
  () => playerRepo.where('id', playerConfig.value.id).first(),
  (val, old) => {
    if (val && old && val.volume !== old.volume) player.setVolume(val.volume);
  },
);
</script>

<style scoped>
.target {
  display: inline;
}
</style>
