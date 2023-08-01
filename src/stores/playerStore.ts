import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import {
  RoomListItem,
  PlayerList,
  PlayerConfigList,
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
    const debug = ref(false);

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
      debug,
      switchBackgroundMode,
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
        'config',
        'debug',
      ],
    },
  },
);
