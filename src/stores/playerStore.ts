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
  PlayerItem,
} from '@/types/player';
import { isPhone } from '@/utils/isMobile';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';

export const usePlayerStore = defineStore(
  'player',
  () => {
    const layoutIndex = ref<number>(isPhone() ? 9 : 15);
    const navState = ref(true);
    const showNightOverlay = ref(false);
    const roomList = ref<RoomListItem[]>([]);
    const menuState = ref(false);
    const topRoomList = ref<PlayerItem[]>([]);
    const nightOverlayOpacity = ref(80);
    const menuItemIsDragging = ref(false);

    const config = reactive({
      autoCloseNav: true,
      leaveWinCloseNav: true,
      backgroundMode: true,
    });

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

    async function addRoom(roomId: number, type: Platform, msg = true) {
      try {
        const res = await getRoomInfo(roomId, type);
        if (res === false) {
          return;
        }

        for (const item of roomList.value) {
          if (item.platform === res.platform && res.roomId === item.roomId) {
            if (msg) {
              await message('直播间已经添加了!');
            }
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
        if (msg) {
          await message('添加成功!');
        }
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

    const queryTop = (roomId: number, platform: Platform) =>
      topRoomList.value.findIndex(
        (item) => item.platform === platform && item.roomId === roomId,
      );

    function addTop(roomId: number, platform: Platform) {
      if (queryTop(roomId, platform) === -1) {
        topRoomList.value.push({
          roomId,
          platform,
        });
      }
    }

    function removeTop(roomId: number, platform: Platform) {
      const index = queryTop(roomId, platform);
      if (index !== -1) {
        topRoomList.value.splice(index, 1);
      }
    }

    function switchBackgroundMode(state: boolean) {
      config.backgroundMode = state;
      if (!isPhone()) return;
      if (state) {
        BackgroundMode.enable();
        BackgroundMode.disableWebViewOptimizations();
      } else {
        BackgroundMode.disable();
        BackgroundMode.enableWebViewOptimizations();
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
      nightOverlayOpacity,
      topRoomList,
      config,
      switchBackgroundMode,
      updateRoomInfo,
      removeRoom,
      addRoom,
      queryTop,
      addTop,
      removeTop,
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
        'topRoomList',
      ],
    },
  },
);
