import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { getRoomInfo } from '@/api/getOrgin';
import { message } from '@/utils/message';
import { IMAGE_PROXY } from '@/config/proxy';
import {
  RoomListItem,
  PlayerList,
  PlayerConfigList,
  Platform,
} from '@/types/player';

export const usePlayerStore = defineStore(
  'player',
  () => {
    const layoutIndex = ref<number>(3);
    const navState = ref(true);
    const showNightOverlay = ref(false);
    const roomList = ref<RoomListItem[]>([]);
    const menuState = ref(false);
    const nightOverlayOpacity = ref(80);
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
    const playerListConfig = reactive<PlayerConfigList>({
      a: { volume: 0, danmu: false },
      b: { volume: 0, danmu: false },
      c: { volume: 0, danmu: false },
      d: { volume: 0, danmu: false },
      e: { volume: 0, danmu: false },
      f: { volume: 0, danmu: false },
      g: { volume: 0, danmu: false },
      h: { volume: 0, danmu: false },
    });

    async function addRoom(roomId: number, type: Platform) {
      try {
        const res = await getRoomInfo(roomId, type);
        if (res === false) {
          return;
        }

        for (const item of roomList.value) {
          if (item.platform === res.platform && res.roomId === item.roomId) {
            await message('直播间已经添加了!');
            return;
          }
        }

        res.keyframe =
          type === Platform.Bili ? IMAGE_PROXY + res.keyframe : res.keyframe;

        res.face = type === Platform.Bili ? IMAGE_PROXY + res.face : res.face;

        roomList.value.push({
          roomId: res.roomId,
          platform: res.platform,
          name: res.name,
          face: res.face,
          title: res.title,
          news: res.news,
          keyframe: res.keyframe,
          status: res.status,
          shortId: res.shortId,
        });

        await message('添加成功!');
      } catch (error) {
        error;
      }
    }

    async function updateRoomInfo(
      roomId: number,
      platform: Platform,
      msg = true,
    ) {
      const res = await getRoomInfo(roomId, platform);
      if (res) {
        const item = roomList.value.find(
          (item) => item.roomId === res.roomId && item.platform === platform,
        );
        if (item === undefined) return;
        item.name = res.name;
        item.face = IMAGE_PROXY + res.face;
        item.roomId = res.roomId;
        item.title = res.title;
        item.news = res.news;
        item.keyframe = IMAGE_PROXY + res.keyframe;
        item.status = res.status;
        if (msg) await message('更新成功!');
      }
    }

    async function removeRoom(roomId: number, platform: Platform) {
      const findIndex = roomList.value.findIndex(
        (item) => item.roomId === roomId && item.platform === platform,
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
      addRoom,
      nightOverlayOpacity,
    };
  },
  {
    persist: {
      paths: [
        'layoutIndex',
        'roomList',
        'playerList',
        'playerListConfig',
        'nightOverlayOpacity',
      ],
    },
  },
);
