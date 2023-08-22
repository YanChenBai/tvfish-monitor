import { LiveConfig, ConfigType, UsePlayer } from '@/types/playerNew';
import { useTimeoutPoll, useCounter } from '@vueuse/core';
import FlvJs from 'flv.js';
import Hls from 'hls.js';
import { Ref, reactive } from 'vue';

function initFlv(el: HTMLMediaElement, url: string) {
  const player: FlvJs.Player = FlvJs.createPlayer(
    {
      type: 'flv',
      isLive: true,
      url,
    },
    {
      enableStashBuffer: false,
      enableWorker: false,
      autoCleanupSourceBuffer: true,
      fixAudioTimestampGap: false,
    },
  );
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
        // console.log(error);
      }
    },
  };
}

function initHls(el: HTMLMediaElement, url: string) {
  const player = new Hls({
    debug: false,
  });
  player.attachMedia(el);
  player.loadSource(url);
  return {
    player,
    destroy: () => player.destroy(),
  };
}

export function usePlayer(
  video: Ref<HTMLMediaElement>,
  config: LiveConfig,
): UsePlayer {
  const player = reactive<UsePlayer>({
    destroy: () => null,
    refresh: () => null,
    changePlayer: () => null,
    setVolume: (val: number) => {
      if (video.value === undefined)
        throw new Error('Player is not initialized!');
      video.value.volume = val / 100;
    },
  });

  // 初始化
  function changePlayer() {
    if (video.value === undefined) throw new Error('init after onMounted!');
    if (config.url.length === 0) return;
    if (config.type === ConfigType.Flv) {
      const { destroy: flvDestroy, player: flvPlayer } = initFlv(
        video.value,
        config.url,
      );
      player.destroy = () => flvDestroy();
    }
    if (config.type === ConfigType.Hls) {
      const { destroy: hlsDestroy, player: hlsPlayer } = initHls(
        video.value,
        config.url,
      );
      player.destroy = () => hlsDestroy();
    }
  }

  player.changePlayer = changePlayer;
  player.refresh = () => {
    player.destroy();
    changePlayer();
  };

  return player;
}

export function autoRefresh(
  video: Ref<HTMLMediaElement>,
  refresh: { (): void },
) {
  const { count, inc, reset } = useCounter();

  const tryRefresh = async () => {
    inc();
    refresh();
    if (count.value >= 12) {
      pause();
      reset();
    }
  };

  const { pause, resume } = useTimeoutPoll(tryRefresh, 1000, {
    immediate: false,
  });

  let timer = 0;
  function timeUpdate() {
    clearTimeout(timer);
    pause();
    timer = setTimeout(() => {
      resume();
    }, 5000);
  }

  const start = () => {
    console.log('start');
    video.value.addEventListener('timeupdate', timeUpdate, false);
  };

  const clear = () => {
    video.value.removeEventListener('timeupdate', timeUpdate, false);
    pause();
    reset();
  };

  return {
    start,
    clear,
  };
}
