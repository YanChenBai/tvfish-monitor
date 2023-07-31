import { usePlayerStore } from '@/stores/playerStore';

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
