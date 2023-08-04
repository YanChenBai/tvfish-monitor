import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import {
  RoomListItem,
  PlayerList,
  PlayerConfigList,
  PlayerItem,
  PinyinInfo,
} from '@/types/player';
import { isElecreon, isPhone } from '@/utils/isMobile';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';

type LayoutList = Array<{ x: number; y: number; w: number; h: number }[]>;
declare global {
  interface Window {
    api: {
      getConfig: {
        (): LayoutList;
      };
      watchConfig: {
        (cb: { (config: LayoutList): void }): void;
      };
    };
  }
}

export const usePlayerStore = defineStore(
  'player',
  () => {
    const configLayout = ref<LayoutList>([]);
    const layoutIndex = ref<number>(isPhone() ? 9 : 15);
    const navState = ref(true);
    const showNightOverlay = ref(false);
    const roomList = ref<RoomListItem[]>([]);
    const menuState = ref(false);
    const topRoomList = ref<PlayerItem[]>([]);
    const pinyinList = ref<PinyinInfo[]>([]);
    const nightOverlayOpacity = ref(80);
    const menuItemIsDragging = ref(false);
    const debug = ref(false);

    const config = reactive({
      autoCloseNav: true,
      leaveWinCloseNav: true,
      backgroundMode: true,
      autoUpdateMaxCount: 10,
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
      i: null,
      j: null,
      k: null,
      l: null,
      m: null,
      n: null,
      o: null,
      p: null,
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
      i: { volume: 0, danmu: false },
      j: { volume: 0, danmu: false },
      k: { volume: 0, danmu: false },
      l: { volume: 0, danmu: false },
      m: { volume: 0, danmu: false },
      n: { volume: 0, danmu: false },
      o: { volume: 0, danmu: false },
      p: { volume: 0, danmu: false },
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

    if (isElecreon()) {
      window.api.watchConfig((data: LayoutList) => {
        console.log(data);
        configLayout.value = data;
      });
    }

    return {
      configLayout,
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
      pinyinList,
      switchBackgroundMode,
    };
  },
  {
    persist: {
      paths: [
        'layoutIndex',
        'roomList',
        'pinyinList',
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
