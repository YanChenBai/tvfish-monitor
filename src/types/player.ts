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
}

export interface PlayerList {
  [key: string]: RoomListItem | null;
}

interface PlayerConfigItem {
  volume: number;
  danmu: boolean;
}

export interface PlayerConfigList {
  [key: string]: PlayerConfigItem;
}
