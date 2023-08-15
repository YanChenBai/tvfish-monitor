import {
  LiveConfig,
  PlayerOrgin,
  ConfigType,
  UsePlayer,
} from '@/types/playerNew';
import DPlayer from 'dplayer';
import FlvJs from 'flv.js';
import Hls from 'hls.js';
import { Ref, reactive, watch } from 'vue';

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

function useDPlayer(video: HTMLDivElement): DPlayer {
  return new DPlayer({
    container: video,
    live: true,
    mutex: false,
    preventClickToggle: true,
    volume: 0,
    hotkey: false,
    video: {
      url: '',
      type: 'autoType',
      customType: {
        autoType: () => ({}),
      },
    },
  });
}

export function usePlayer(
  video: Ref<HTMLDivElement | undefined>,
  config: LiveConfig,
): UsePlayer {
  if (video.value === undefined) throw new Error('Use it in onMounted!');

  const player = reactive<UsePlayer>({
    destroy: () => null,
    refresh: () => null,
    changePlayer: () => null,
    playerOrgin: null,
    dplayer: useDPlayer(video.value),
  });

  // 初始化
  function changePlayer() {
    if (!config) return;
    if (config.type === ConfigType.Flv) {
      const { destroy: flvDestroy, player: flvPlayer } = initFlv(
        player.dplayer.video,
        config.url,
      );
      player.destroy = () => {
        player.playerOrgin = null;
        flvDestroy();
      };
      player.playerOrgin = {
        type: ConfigType.Flv,
        player: flvPlayer,
      };
    } else if (config.type === ConfigType.Hls) {
      const { destroy: hlsDestroy, player: hlsPlayer } = initHls(
        player.dplayer.video,
        config.url,
      );
      player.destroy = () => {
        player.playerOrgin = null;
        return hlsDestroy();
      };
      player.playerOrgin = {
        type: ConfigType.Hls,
        player: hlsPlayer,
      };
    }
  }

  // 刷新
  function refresh() {
    player.destroy();
    changePlayer();
  }

  player.changePlayer = changePlayer;
  player.refresh = refresh;

  // 自动刷新
  watch(config, () => {
    console.log(config);
    refresh();
  });

  return player;
}
