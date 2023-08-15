<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrapRef" v-show="menuState">
      <MenuContent ref="menuContentRef" :disabled="disabled" />
      <Setting ref="settingRef" />
      <Tips ref="tipsRef" />
      <Btns ref="btnsRef" @goTop="goTop" />
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
import { storeToRefs } from 'pinia';
import { computed, onMounted, provide, ref } from 'vue';
import Room from '@/stores/room';
import { menuProvides } from '@/utils/provides';

defineOptions({ name: 'menuCompoent' });
const { menuState } = storeToRefs(usePlayerStore()),
  menuWrapRef = ref(),
  settingRef = ref<InstanceType<typeof Setting>>(),
  tipsRef = ref<InstanceType<typeof Tips>>(),
  btnsRef = ref<InstanceType<typeof Btns>>(),
  menuContentRef = ref<InstanceType<typeof MenuContent>>();

const disabled = computed(() => {
  if (btnsRef.value) {
    return btnsRef.value.loading.update || btnsRef.value.loading.add;
  } else {
    return false;
  }
});

function openSetting(room: Room) {
  if (settingRef.value) settingRef.value.open(room);
}

function openTips(room: Room) {
  if (tipsRef.value) tipsRef.value.open(room);
}

function goTop() {
  if (menuContentRef.value) menuContentRef.value.goTop();
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

provide(menuProvides, {
  openSetting,
  openTips,
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
