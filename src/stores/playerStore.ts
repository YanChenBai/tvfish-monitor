import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { getRoomInfo } from '@/api/getOrgin';
import { message } from '@/utils/message';
import { IMAGE_PROXY } from '@/config/proxy';

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
  realId: string;
  title: string;
  news: string;
  keyframe: string;
  status: number;
}

export const usePlayerStore = defineStore(
  'player',
  () => {
    const layoutIndex = ref<number>(3);
    const navState = ref(true);
    const showNightOverlay = ref(false);
    const roomList = ref<RoomListItem[]>([]);
    const menuState = ref(false);
    const menuItemIsDragging = ref(false);
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

    async function updateRoomInfo(roomId: string, platform: Platform) {
      const res = await getRoomInfo(Number(roomId), platform);
      if (res) {
        const item = roomList.value.find(
          (item) => item.realId === res.room_id && item.platform === platform,
        );
        if (item === undefined) return;
        item.name = res.name;
        item.face = IMAGE_PROXY + res.face;
        item.realId = res.room_id;
        item.title = res.title;
        item.news = res.news;
        item.keyframe = IMAGE_PROXY + res.keyframe;
        item.status = res.live_status;

        await message('更新成功!');
      }
    }
    async function removeRoom(roomId: string, platform: Platform) {
      const findIndex = roomList.value.findIndex(
        (item) => item.realId === roomId && item.platform === platform,
      );
      if (findIndex !== -1) {
        roomList.value.splice(findIndex, 1);
        await message('更新成功!');
      }
    }

    return {
      layoutIndex,
      roomList,
      playerList,
      menuState,
      navState,
      playerListConfig,
      showNightOverlay,
      menuItemIsDragging,
      updateRoomInfo,
      removeRoom,
    };
  },
  {
    persist: {
      paths: ['layoutIndex', 'roomList', 'playerList', 'playerListConfig'],
    },
  },
);
