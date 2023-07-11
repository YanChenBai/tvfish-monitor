import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export interface PlayerList {
  a: RoomListItem | null;
  b: RoomListItem | null;
  c: RoomListItem | null;
  d: RoomListItem | null;
  e: RoomListItem | null;
  f: RoomListItem | null;
  g: RoomListItem | null;
  h: RoomListItem | null;
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
    return {
      layoutIndex,
      roomList,
      playerList,
      menuState,
    };
  },
  {
    persist: {
      paths: ['layoutIndex', 'roomList', 'playerList'],
    },
  },
);
