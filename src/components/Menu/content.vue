<template>
  <!-- 搜索直播间 -->
  <div>
    <ion-input
      style="min-height: 26px; margin-bottom: 10px; color: #ffff"
      color="primary"
      placeholder="搜索主播"
      :clear-input="true"
      v-model:modelValue="keywordDebounced"
    ></ion-input>
  </div>

  <!-- 直播间列表 -->
  <div class="menu-content hide-scrollbar" ref="menuContentRef">
    <div v-for="item in list" class="menu-content-item">
      <MenuItem
        :key="`${item.platform}@${item.roomId}`"
        :disabled="disabled"
        :info="item"
        @drag="() => (playerStore.menuState = false)"
        @setting="openSetting(item)"
        @tips="openTips(item)"
      ></MenuItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonInput } from '@ionic/vue';
import { useConfigStore } from '@/stores/config';
import MenuItem from '@/components/Menu/item.vue';
import { computed, ref, watch } from 'vue';
import { useScroll, watchDebounced } from '@vueuse/core';
import { vibrate } from '@/utils/impact';
import injectStrict from '@/utils/injectStrict';
import { menuProvides, repoProvides } from '@/utils/provides';
import RoomStore from '@/stores/room';
import { useSearch } from '@/hooks/useSearch';

defineOptions({ name: 'menuContent' });
defineProps<{
  disabled: boolean;
}>();
const { roomRepo } = injectStrict(repoProvides);
const { openSetting, openTips } = injectStrict(menuProvides);
const playerStore = useConfigStore();
const keywordDebounced = ref(),
  keyword = ref(''),
  menuContentRef = ref(),
  { arrivedState } = useScroll(menuContentRef);

const list = computed(() => {
  let data = roomRepo.orderBy('isTop', 'desc').get();
  if (keyword.value.length === 0) return data;
  try {
    data = data.filter((item: RoomStore) => useSearch(keyword.value, item));
  } catch (error) {
    return data;
  }
  return data;
});

// 返回顶部
function goTop() {
  menuContentRef.value.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

watchDebounced(
  keywordDebounced,
  (val) => {
    keyword.value = val;
  },
  { debounce: 100, maxWait: 1000 },
);

// 监听滚动条到底部或者顶部
watch(arrivedState, (val) => {
  if (val.top || val.bottom) vibrate(10);
});

defineExpose({
  list,
  goTop,
});
</script>

<style scoped>
@import '@/theme/hideScrollbar.css';
.menu-wrap {
  width: 300px;
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(20, 20, 20, 1);
  z-index: 9999;
  padding: 10px;
}
.menu-content {
  height: calc(100vh - 66px - 36px);
  box-sizing: border-box;
  width: calc(100%);
  overflow-y: scroll;
}
.menu-content-item:not(:first-child) {
  margin-top: 20px;
}
</style>
@/stores/config
