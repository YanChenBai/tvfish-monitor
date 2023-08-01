<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrapRef" v-show="menuState">
      <MenuContent :disabled="false" @setting="openSetting" @tips="openTips" />
      <Setting ref="settingRef" />
      <Tips ref="tipsRef" />
      <Btns ref="btnsRef" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import MenuContent from './content.vue';
import Setting from '@/components/Menu/setting.vue';
import Tips from '@/components/Menu/tips.vue';
import Btns from './btns.vue';
import { useMenu } from '@/hooks/useMenu';
import { usePlayerStore } from '@/stores/playerStore';
import { RoomListItem } from '@/types/player';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

defineOptions({ name: 'menuCompoent' });
const { menuState } = storeToRefs(usePlayerStore()),
  menuWrapRef = ref(),
  settingRef = ref<InstanceType<typeof Setting>>(),
  tipsRef = ref<InstanceType<typeof Tips>>(),
  btnsRef = ref<InstanceType<typeof Btns>>();

function openSetting(room: RoomListItem) {
  if (settingRef.value) settingRef.value.open(room);
}

function openTips(room: RoomListItem) {
  if (tipsRef.value) tipsRef.value.open(room);
}

onMounted(() => {
  if (settingRef.value && btnsRef.value)
    useMenu(menuWrapRef, [
      ...settingRef.value.ignore,
      ...btnsRef.value.ignore,
      menuWrapRef,
      tipsRef,
    ]);
});
</script>

<style scoped>
.menu-wrap {
  width: 300px;
  height: 100%;
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(20, 20, 20, 1);
  z-index: 9999;
  padding: 10px;
}

.menu-enter-active,
.menu-leave-active {
  transition: transform 0.3s ease;
}

.menu-enter-from,
.menu-leave-to {
  transform: translateX(100%);
}
</style>
