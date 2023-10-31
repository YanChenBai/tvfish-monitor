import { LayoutList } from './types/player';

declare global {
  interface Window {
    api: {
      getConfig: {
        (): LayoutList;
      };
      watchConfig: {
        (cb: { (config: LayoutList): void }): void;
      };
      liveApi: {
        getRoomInfo: any;
      };
    };
  }
}
