<template>
  <!-- 搜索直播间 -->
  <div>
    <ion-input
      style="min-height: 26px; margin-bottom: 10px; color: #ffff"
      color="primary"
      placeholder="搜索主播"
      :clear-input="true"
      v-model:modelValue="keyword"
    ></ion-input>
  </div>

  <!-- 直播间列表 -->
  <div class="menu-content hide-scrollbar" ref="menuContentRef">
    <div v-for="item in showList" class="menu-content-item">
      <!-- updateLoading || addloading -->
      <MenuItem
        :key="`${item.platform}@${item.roomId}`"
        :disabled="disabled"
        :info="item"
        @drag="() => (playerStore.menuState = false)"
        @setting="$emit('setting', item)"
        @tips="$emit('tips', item)"
      ></MenuItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonInput } from '@ionic/vue';
import { usePlayerStore } from '@/stores/playerStore';
import MenuItem from '@/components/Menu/item.vue';
import { RoomListItem } from '@/types/player';
import { ref, watch } from 'vue';
import { useScroll, watchDebounced } from '@vueuse/core';
import { vibrate } from '@/utils/impact';

defineOptions({ name: 'menuContent' });

defineEmits<{
  (e: 'setting', item: RoomListItem): void;
  (e: 'tips', item: RoomListItem): void;
}>();
defineProps<{
  disabled: boolean;
}>();

const playerStore = usePlayerStore();
const showList = ref<RoomListItem[]>(playerStore.roomList),
  keyword = ref(),
  menuContentRef = ref(),
  { arrivedState } = useScroll(menuContentRef);

// 搜索节流
watchDebounced(
  keyword,
  (val) => {
    showList.value = playerStore.roomList.filter((item) => {
      const findName = item.name.search(val) !== -1;
      const findTags = item.tags ? item.tags.search(val) !== -1 : false;
      return findName || findTags;
    });
  },
  {
    debounce: 100,
    maxWait: 1000,
  },
);

// 返回顶部
function goTop() {
  menuContentRef.value.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// 监听滚动条到底部或者顶部
watch(arrivedState, (val) => {
  if (val.top || val.bottom) vibrate(10);
});

defineExpose({
  showList,
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
