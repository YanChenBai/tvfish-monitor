import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { isElecreon, isPhone } from '@/utils/isMobile';
import { LayoutList } from '@/types/player';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';

export const useConfigStore = defineStore(
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
      autoUpdateRoomList: 0,
      closeLivePreview: {
        image: true,
        text: true,
      },
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
