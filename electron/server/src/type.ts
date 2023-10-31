import { FitEnum } from 'sharp';

export enum Platform {
  Douyu = 'douyu',
  Bili = 'bili',
}

export type LiveInfoParams =
  | {
      type: Platform.Douyu;
      roomId: string;
      qn: number | null;
      line: string | null;
    }
  | {
      type: Platform.Bili;
      roomId: string;
      qn: number;
      line: number;
    };

export interface GetRoomInfoType {
  roomId: string;
  type: Platform;
}

export interface ImageParams {
  url: string;
  fit?: keyof FitEnum;
  w?: number;
  h?: number;
  ac: boolean;
}
