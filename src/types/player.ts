import PlayerStore from '@/stores/player';
import FlvJs from 'flv.js';
import Hls from 'hls.js';
import { ComputedRef } from 'vue';

export enum ConfigType {
  Flv = 'flv',
  Hls = 'hls',
}

export interface Config {
  url: string;
  type: ConfigType;
}

export interface QualityType {
  name: string;
  qn: number;
}
export interface LineType {
  name: string;
  line: string;
}

export enum Platform {
  Douyu = 'douyu',
  Bili = 'bili',
}

export enum RoomStatus {
  CLOSE = 0,
  LIVE = 1,
  REC = 2,
}

export interface RoomListItem {
  roomId: number;
  platform: Platform;
  name: string;
  face: string;
  title: string;
  news: string;
  keyframe: string;
  status: RoomStatus;
  shortId: number;
  tags: string;
}

export interface RoomListItemMany {
  [key: string]: Omit<RoomListItem, 'news'>;
}

export interface PlayerItem {
  roomId: number;
  platform: Platform;
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
  lines: LineType[];
  quality: number | null;
  qualitys: QualityType[];
  type: ConfigType;
  url: string;
}

export interface UsePlayer {
  destroy: { (): void };
  refresh: { (): void };
  changePlayer: { (): void };
  setVolume: { (val: number): void };
}

export enum DragType {
  CARD_DRAG = 'card_drag',
  PLAYER_DRAG = 'player_drag',
}

export type DragTypeItem =
  | {
      type: DragType.PLAYER_DRAG;
      playerConfig: ComputedRef<PlayerStore>;
      liveConfig: LiveConfig;
    }
  | {
      type: DragType.CARD_DRAG;
      roomTypeId: string;
    };

export interface Room {
  roomId: number;
  platform: Platform;
  name: string;
  face: string;
  title: string;
  news: string;
  keyframe: string;
  status: RoomStatus;
  shortId: number;
  tags: string;
}

export interface ResType<T = any> {
  code: number;
  data: T;
  message: string;
}
interface OrginType {
  url: string;
  quality: QualityType[];
  qn: number;
  lines: LineType[];
  line: string;
  info: Room;
}

interface OrginTypeLive extends ResType {
  code: 200;
  data: OrginType;
}

interface OrginTypeClose extends ResType {
  code: -5;
  data: Room;
}

export type GetOrgin = OrginTypeLive | OrginTypeClose;

export type LayoutList = Array<
  { x: number; y: number; w: number; h: number }[]
>;
