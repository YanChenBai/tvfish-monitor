import { usePlayerStore } from '@/stores/playerStore';
import StoreQuery from '@/utils/storeQuey';

export default function useTopRoom() {
  const playerStore = usePlayerStore();
  const curd = new StoreQuery(playerStore.topRoomList);
  return curd;
}
