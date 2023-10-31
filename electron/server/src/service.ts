import douyuLive from './douyu';
import biliLive from './bili';
import { Platform, LiveInfoParams } from './type';

export async function getLiveInfo(params: LiveInfoParams) {
  switch (params.type) {
    case Platform.Douyu:
      return await douyuLive.getLiveInfo(params.roomId, params.qn, params.line);
    case Platform.Bili:
      return await biliLive.getLiveInfo(params.roomId, params.qn, params.line);
  }
}

export async function getRoomInfo(type: Platform, roomId: string) {
  switch (type) {
    case 'bili':
      return await biliLive.getUserInfo(roomId);
    case 'douyu':
      return await douyuLive.getUserInfo(roomId);
  }
}

export const getRoomInfoManyBili = biliLive.getRoomInfoMany;
