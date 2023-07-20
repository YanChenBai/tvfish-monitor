import Hls from 'hls.js';
import FlvJs from 'flv.js';

export enum ConfigType {
  Flv = 'flv',
  Hls = 'hls',
}
export interface Config {
  url: string;
  type: ConfigType;
  volume: number;
}

export default class LiveDanmuPlayer {
  el: HTMLMediaElement | null = null;
  config: Config | null = null;
  player: FlvJs.Player | Hls | null = null;
  flvSyncTimer: number | null = null;
  // 解码帧
  lastDecodedFrame = 0;
  // 跳帧间隔
  autoSkipFrameInterval = 0.5;

  // 重连刷新限制
  ReconnectionLimit = 10;
  nowReNum = 0;

  constructor(el: HTMLMediaElement, config: Config) {
    this.el = el;
    this.config = config;
  }

  destroy: { (): void } = () => ({});

  init() {
    this.lastDecodedFrame = 0;
    if (this.config === null) return;
    switch (this.config.type) {
      case 'flv':
        this.initFlv();
        break;
      case 'hls':
        this.initHls();
        break;
    }
  }

  initHls() {
    if (this.config === null) return;
    const hlsPlayer = new Hls({
      debug: false,
      manifestLoadingMaxRetry: 1,
      manifestLoadingMaxRetryTimeout: 6000,
      levelLoadingMaxRetry: 4,
      levelLoadingMaxRetryTimeout: 4000,
      nudgeMaxRetry: 0,
      fragLoadingMaxRetry: 2,
    });
    hlsPlayer.attachMedia(this.el!);
    hlsPlayer.loadSource(this.config.url);
    this.el!.volume = this.config.volume;
    // hlsPlayer
    this.player = hlsPlayer;
    this.destroy = () => hlsPlayer.destroy();
  }

  initFlv() {
    if (this.config === null) return;
    const flvPlayer: FlvJs.Player = FlvJs.createPlayer({
      type: 'flv',
      url: this.config.url,
    });
    flvPlayer.attachMediaElement(this.el!);
    flvPlayer.load();
    flvPlayer.volume = this.config.volume;
    flvPlayer.play();
    this.player = flvPlayer;
    this.autoReconnection(this.config);
    this.destroy = () => {
      try {
        flvPlayer.pause();
        flvPlayer.unload();
        flvPlayer.detachMediaElement();
        flvPlayer.destroy();
        if (this.flvSyncTimer !== null) clearTimeout(this.flvSyncTimer);
      } catch (error) {
        error;
      }
    };
  }

  refresh(config: Config) {
    this.config = config;
    this.destroy();
    this.init();
  }

  modifyVolume(value: number) {
    if (this.config === null) return;
    switch (this.config.type) {
      case 'flv':
        (this.player as FlvJs.Player).volume = value;
        break;
      case 'hls':
        this.el!.volume = value;
        break;
    }
  }

  reconnectionRefresh(config: Config) {
    if (this.nowReNum < this.ReconnectionLimit) {
      this.refresh(config);
      this.nowReNum++;
    }
  }

  autoReconnection(config: Config) {
    if (this.player === null) return;
    const player = this.player as FlvJs.Player;

    // 断流重连
    player.on(FlvJs.Events.ERROR, () => {
      if (this.player) this.reconnectionRefresh(config);
    });

    // 画面卡死重连
    player.on(
      FlvJs.Events.STATISTICS_INFO,
      (res: FlvJs.FlvPlayerStatisticsInfo) => {
        if (this.lastDecodedFrame === 0) {
          if (res.decodedFrames !== undefined)
            this.lastDecodedFrame = res.decodedFrames;
          return;
        } else if (this.lastDecodedFrame != res.decodedFrames) {
          if (res.decodedFrames !== undefined)
            this.lastDecodedFrame = res.decodedFrames;
        } else {
          this.lastDecodedFrame = 0;
          if (this.player) this.reconnectionRefresh(config);
        }
      },
    );

    // Flv自动跳帧
    setInterval(() => {
      if (player.buffered.length) {
        const end = player.buffered.end(0); // 最新的buff数据
        const diff = end - player.currentTime;
        if (diff >= this.autoSkipFrameInterval) {
          player.currentTime = player.buffered.end(0);
        }
      }
    });
  }
}
