import Hls from 'hls.js';
import FlvJs from 'flv.js';
import { ConfigType, Config } from './type';
import { ref } from 'vue';

export default class LiveDanmuPlayer {
  el: HTMLMediaElement | null = null;
  config: Config | null = null;
  player: FlvJs.Player | Hls | null = null;

  constructor(el: HTMLMediaElement, config: Config) {
    this.el = el;
    this.config = config;
  }

  destroy: { (): void } = () => {};

  init() {
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
    const hlsPlayer = new Hls();
    hlsPlayer.attachMedia(this.el!);
    hlsPlayer.loadSource(this.config.url);
    this.el!.volume = 0;
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
    flvPlayer.volume = 0;
    flvPlayer.play();
    this.player = flvPlayer;
    this.destroy = () => flvPlayer.destroy();
  }

  refresh(config: Config) {
    this.destroy();
    this.config = config;
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
}
