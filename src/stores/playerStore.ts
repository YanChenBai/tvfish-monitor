import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export interface PlayerList {
  [key: string]: RoomListItem | null;
}
interface PlayerItemConfig {
  volume: number;
  danmu: boolean;
}
export interface PlayerListConfig {
  [key: string]: PlayerItemConfig;
}

export enum Platform {
  Douyu = 'douyu',
  Bili = 'bili',
}
export interface RoomListItem {
  roomId: number;
  platform: Platform;
  name: string;
  face: string;
  title: string;
  news: string;
  keyframe: string;
}

export const usePlayerStore = defineStore(
  'player',
  () => {
    const layoutIndex = ref<number>(3);
    const navState = ref(true);
    const roomList = ref<RoomListItem[]>([]);
    const menuState = ref(false);
    const playerList = reactive<PlayerList>({
      a: null,
      b: null,
      c: null,
      d: null,
      e: null,
      f: null,
      g: null,
      h: null,
    });
    const playerListConfig = reactive<PlayerListConfig>({
      a: { volume: 0, danmu: false },
      b: { volume: 0, danmu: false },
      c: { volume: 0, danmu: false },
      d: { volume: 0, danmu: false },
      e: { volume: 0, danmu: false },
      f: { volume: 0, danmu: false },
      g: { volume: 0, danmu: false },
      h: { volume: 0, danmu: false },
    });
    return {
      layoutIndex,
      roomList,
      playerList,
      menuState,
      navState,
      playerListConfig,
    };
  },
  {
    persist: {
      paths: ['layoutIndex', 'roomList', 'playerList', 'playerListConfig'],
    },
  },
);
