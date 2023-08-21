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
import { usePlayerStore } from '@/stores/playerStore';
import MenuItem from '@/components/Menu/item.vue';
import { computed, ref, watch } from 'vue';
import { useScroll, watchDebounced } from '@vueuse/core';
import { vibrate } from '@/utils/impact';
import injectStrict from '@/utils/injectStrict';
import { menuProvides, repoProvides } from '@/utils/provides';
import { Platform, RoomStatus } from '@/types/player';
import RoomStore from '@/stores/room';

defineOptions({ name: 'menuContent' });
defineProps<{
  disabled: boolean;
}>();
const { roomRepo } = injectStrict(repoProvides);
const { openSetting, openTips } = injectStrict(menuProvides);
const playerStore = usePlayerStore();
const keywordDebounced = ref(),
  keyword = ref(''),
  menuContentRef = ref(),
  { arrivedState } = useScroll(menuContentRef);

function searchPlatform(str: string, platform: Platform) {
  // 筛选平台
  switch (str) {
    case 'b站':
    case '哔哩哔哩':
    case '哔哩':
    case 'bl':
    case 'bili':
    case 'bilibili':
      return platform === Platform.Bili;
    case '斗鱼':
    case 'douyu':
    case 'dy':
      return platform === Platform.Douyu;
    default:
      return undefined;
  }
}

function searchStatus(str: string, status: RoomStatus) {
  // 筛选直播状态
  switch (str) {
    case 'live':
    case '直播':
    case '上班':
      return status === RoomStatus.LIVE;
    case 'close':
    case '下播':
    case '下班':
      return status === RoomStatus.CLOSE;
    case 'rec':
    case '轮播':
    case '录像':
      return status === RoomStatus.REC;
    default:
      return undefined;
  }
}

const list = computed(() => {
  let data = roomRepo.orderBy('isTop', 'desc').get();

  try {
    data = data.filter((item: RoomStore) => {
      const keys = keyword.value.toLocaleLowerCase().split(' ');
      // 单条件
      if (keys.length === 1) {
        const sp = searchPlatform(keys[0], item.platform);
        if (sp !== undefined) return sp;
        const ss = searchStatus(keys[0], item.status);
        if (ss !== undefined) return ss;
      } else if (keys.length === 2) {
        // 算条件筛选
        const sp = searchPlatform(keys[0], item.platform);
        const ss = searchStatus(keys[1], item.status);
        if (sp !== undefined && ss !== undefined) return sp && ss;
      }

      const status: boolean[] = [];
      // 标签拼音和缩写
      status.push(
        item.tagsPinyin.find(
          (item: string) => item.search(keyword.value) !== -1,
        ) !== undefined,
      );

      // 名字拼音和缩写
      status.push(
        item.namePinyin.find(
          (item: string) => item.search(keyword.value) !== -1,
        ) !== undefined,
      );

      // 主播名字
      status.push(
        item.name
          .toLocaleLowerCase()
          .search(keyword.value.toLocaleLowerCase()) !== -1,
      );

      // 标签
      status.push(
        item.tags
          .toLocaleLowerCase()
          .search(keyword.value.toLocaleLowerCase()) !== -1,
      );

      // 房间标题
      status.push(
        item.title
          .toLocaleLowerCase()
          .search(keyword.value.toLocaleLowerCase()) !== -1,
      );

      // 公告
      status.push(
        item.news
          .toLocaleLowerCase()
          .search(keyword.value.toLocaleLowerCase()) !== -1,
      );
      // 真实房间号
      status.push(item.roomId.toString() === keyword.value);

      // 房间短号
      status.push(
        item.shortId === 0 ? false : item.shortId.toString() === keyword.value,
      );

      return status.indexOf(true) !== -1;
    });
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
