import { LiveConfig, ConfigType, UsePlayer } from '@/types/player';
import { useTimeoutPoll, useCounter } from '@vueuse/core';
import FlvJs from 'flv.js';
import Hls from 'hls.js';
import { Ref, reactive } from 'vue';

function initFlv(el: HTMLMediaElement, url: string) {
  let player: FlvJs.Player | null = FlvJs.createPlayer(
    {
      type: 'flv',
      isLive: true,
      url,
    },
    {
      enableWorker: false,
      enableStashBuffer: false,
      autoCleanupSourceBuffer: true,
      reuseRedirectedURL: true,
      fixAudioTimestampGap: false,
      isLive: true,
    },
  );
  player.attachMediaElement(el);
  player.load();
  player.play();

  return {
    player,
    destroy: () => {
      try {
        if (player) {
          player.pause();
          player.unload();
          player.detachMediaElement();
          player.destroy();
          player = null;
        }
      } catch (error) {
        console.log(error);
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
    destroy: () => {
      try {
        player.destroy();
      } catch (error) {
        console.log(error);
      }
    },
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
      let lastDecodedFrame = 0;
      flvPlayer.on('statistics_info', function (res) {
        if (lastDecodedFrame == 0) {
          lastDecodedFrame = res.decodedFrames;
          return;
        }
        if (lastDecodedFrame != res.decodedFrames) {
          lastDecodedFrame = res.decodedFrames;
        } else {
          lastDecodedFrame = 0;
          if (flvPlayer) {
            const { destroy: flvDestroy } = initFlv(video.value, config.url);
            player.destroy = () => flvDestroy();
          }
        }
      });
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
    timer = window.setTimeout(() => {
      resume();
    }, 5000);
  }

  const start = () => {
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
