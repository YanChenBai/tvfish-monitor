import layouts from '@/config/lauouts';
import { isElecreon } from '@/utils/isMobile';

interface LayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
}
declare const window: Window & {
  api: {
    getConfig: { (): Array<LayoutItem[]> };
  };
};

export function getLayoutConfig() {
  let layoutsConfig: any = [];
  if (isElecreon()) {
    try {
      const tmp = window.api.getConfig();
      console.log(tmp);

      layoutsConfig = [...layouts, ...tmp];
    } catch (error) {
      layoutsConfig = layouts;
    }
  } else {
    layoutsConfig = layouts;
  }

  return layoutsConfig as Array<LayoutItem[]>;
}
