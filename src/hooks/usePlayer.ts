import FlvJs from 'flv.js';
import Hls from 'hls.js';
import { Ref, watch } from 'vue';

export enum ConfigType {
  Flv = 'flv',
  Hls = 'hls',
}

export interface Config {
  url: string;
  type: ConfigType;
}

function initFlv(el: HTMLMediaElement, url: string) {
  console.log(el);
  const player: FlvJs.Player = FlvJs.createPlayer({
    type: 'flv',
    url,
  });
  player.attachMediaElement(el);
  player.load();
  player.play();

  return {
    player,
    destroy: () => {
      try {
        player.pause();
        player.unload();
        player.detachMediaElement();
        player.destroy();
      } catch (error) {
        error;
      }
    },
  };
}

function initHls(el: HTMLMediaElement, url: string) {
  console.log(el);
  const player = new Hls({
    debug: false,
    manifestLoadingMaxRetry: 10,
    levelLoadingMaxRetry: 10,
    fragLoadingMaxRetry: 10,
    manifestLoadingMaxRetryTimeout: 6000,
    levelLoadingMaxRetryTimeout: 4000,
    nudgeMaxRetry: 5,
  });
  player.attachMedia(el);
  player.loadSource(url);
  return {
    player,
    destroy: () => player.destroy(),
  };
}

export function usePlayer(video: HTMLMediaElement, config: Config | undefined) {
  let player: FlvJs.Player | null | Hls = null;
  let destroy: { (): void } = () => null;

  // 初始化
  function changePlayer() {
    if (!config) return;
    if (config.type === ConfigType.Flv) {
      const { destroy: flvDestroy, player: flvPlayer } = initFlv(
        video,
        config.url,
      );
      destroy = flvDestroy;
      player = flvPlayer;
    } else if (config.type === ConfigType.Hls) {
      const { destroy: hlsDestroy, player: hlsPlayer } = initHls(
        video,
        config.url,
      );
      destroy = hlsDestroy;
      player = hlsPlayer;
    }
  }

  // 刷新
  function refresh() {
    destroy();
    changePlayer();
  }
  console.log(config);

  // 自动刷新
  watch(config!, () => {
    console.log(config);
    refresh();
  });

  return {
    destroy,
    refresh,
    player,
  };
}
