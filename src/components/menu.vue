<template>
  <Transition name="menu">
    <div class="menu-wrap" ref="menuWrap" v-show="menuState">
      <slot></slot>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useMenu } from '@/hooks/useMenu';
import { usePlayerStore } from '@/stores/playerStore';
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';

defineOptions({ name: 'menuCompoent' });

const props = defineProps<{
  ignore: Ref<any>[];
}>();
const { menuState } = storeToRefs(usePlayerStore()),
  menuWrap = ref();

useMenu(menuWrap, [menuWrap, ...props.ignore]);
</script>

<style scoped>
.menu-wrap {
  width: 300px;
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
