import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
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
  'config',
  () => {
    const configLayout = ref<LayoutList>([]);
    const layoutIndex = ref<number>(isPhone() ? 9 : 15);
    const navState = ref(true);
    const showNightOverlay = ref(false);
    const menuState = ref(false);
    const nightOverlayOpacity = ref(80);
    const menuItemIsDragging = ref(false);
    const debug = ref(false);

    const config = reactive({
      autoCloseNav: true,
      leaveWinCloseNav: true,
      backgroundMode: true,
      autoUpdateMaxCount: 10,
      autoUpdateMaxInterval: 2000,
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
      window.api.watchConfig((data: LayoutList) => (configLayout.value = data));
    }

    return {
      configLayout,
      layoutIndex,
      menuState,
      navState,
      showNightOverlay,
      menuItemIsDragging,
      nightOverlayOpacity,
      config,
      debug,
      switchBackgroundMode,
    };
  },
  {
    persist: {
      paths: ['layoutIndex', 'nightOverlayOpacity', 'config', 'debug'],
    },
  },
);
