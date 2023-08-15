import FlvJs from 'flv.js';
import Hls from 'hls.js';
import DPlayer from 'dplayer';

export enum ConfigType {
  Flv = 'flv',
  Hls = 'hls',
}

export interface Config {
  url: string;
  type: ConfigType;
}

export interface PlayerOrginItem<T, P> {
  type: T;
  player: P;
}

export type PlayerOrgin =
  | PlayerOrginItem<ConfigType.Hls, Hls>
  | PlayerOrginItem<ConfigType.Flv, FlvJs.Player>;

export interface LiveConfig {
  line: string | null;
  lines: string[];
  quality: number | null;
  qualitys: string[];
  type: ConfigType;
  url: string;
}

export interface UsePlayer {
  destroy: { (): void };
  refresh: { (): void };
  changePlayer: { (): void };
  playerOrgin: PlayerOrgin | null;
  dplayer: DPlayer;
}

export enum DragType {
  CARD_DRAG = 'card_drag',
  PLAYER_DRAG = 'player_drag',
}

export type DragTypeItem =
  | {
      type: DragType.PLAYER_DRAG;
      roomTypeId: string;
      playerId: number;
    }
  | {
      type: DragType.CARD_DRAG;
      roomTypeId: string;
    };
