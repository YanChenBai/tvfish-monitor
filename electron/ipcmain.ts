import { ipcMain } from 'electron';
import {
  getRoomInfo,
  getLiveInfo,
  getRoomInfoManyBili,
} from './server/src/service';
import getImage from './server/src/image';
import {
  LiveInfoParams,
  GetRoomInfoType,
  ImageParams,
} from './server/src/type';

export default function init() {
  ipcMain.handle(
    'getRoomInfo',
    async (_event, data: GetRoomInfoType) =>
      await getRoomInfo(data.type, data.roomId),
  );

  ipcMain.handle(
    'getLiveInfo',
    async (_event, data: LiveInfoParams) => await getLiveInfo(data),
  );

  ipcMain.handle(
    'getRoomInfoManyBili',
    async (_event, uids: string[]) => await getRoomInfoManyBili(uids),
  );

  ipcMain.handle(
    'getImage',
    async (_event, data: ImageParams) => await getImage(data),
  );
}
