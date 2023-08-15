<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useRepo } from 'pinia-orm';
import PlayerStore from '@/stores/player';
import RoomStore from '@/stores/room';
import { provide } from 'vue';
import { repoProvides } from './utils/provides';
const playerRepo = useRepo(PlayerStore);
const roomRepo = useRepo(RoomStore);

provide(repoProvides, {
  roomRepo,
  playerRepo,
});
</script>
<style>
body {
  overflow: hidden;
  border-radius: 2px;
  background-color: #121212;
}
.dplayer-controller-mask,
.dplayer-controller,
.dplayer-subtitle,
.dplayer-danmaku,
.dplayer-mask,
.dplayer-bezel,
.dplayer-notice-list {
  display: none !important;
}
</style>
