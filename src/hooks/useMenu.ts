import { MaybeElementRef } from '@vueuse/core';
import { Ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { isPhone } from '@/utils/isMobile';
import { useBackButton } from '@ionic/vue';
import { usePlayerStore } from '@/stores/playerStore';

// 菜单逻辑
export function useMenu(el: MaybeElementRef, ignore: Ref<any>[]) {
  const playerStore = usePlayerStore();
  // 关闭Menu
  onClickOutside(el, () => (playerStore.menuState = false), {
    ignore,
  });

  if (isPhone()) {
    // 监听系统返回
    useBackButton(10, () => {
      playerStore.menuState = false;
    });
  }
}

// 排序
const checkStatus = (status: number) => (status === 1 ? 1 : 0);
export function sortList() {
  const playerStore = usePlayerStore();
  const tmpList = playerStore.roomList.sort((a, b) => {
    return checkStatus(b.status) - checkStatus(a.status);
  });
  for (const index in playerStore.topRoomList) {
    const findIndex = tmpList.findIndex(
      (item) =>
        playerStore.topRoomList[index].platform === item.platform &&
        playerStore.topRoomList[index].roomId === item.roomId,
    );
    // 如果在置顶列表里移到第一位
    if (findIndex !== -1) {
      tmpList.unshift(tmpList.splice(findIndex, 1)[0]);
    }
  }
  playerStore.roomList = tmpList;
}
