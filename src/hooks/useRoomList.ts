import { getRoomInfo } from '@/api/getOrgin';
import { IMAGE_PROXY } from '@/config/proxy';
import { usePlayerStore } from '@/stores/playerStore';
import { Platform } from '@/types/player';
import { message } from '@/utils/message';
import StoreQuery from '@/utils/storeQuey';

export default function useRoomList() {
  const playerStore = usePlayerStore();
  const curd = new StoreQuery(playerStore.roomList);

  async function add(roomId: number, platform: Platform, msg = true) {
    try {
      const res = await getRoomInfo(roomId, platform);
      if (res === false) return;
      const find = curd.queryAll({
        platform: res.platform,
        roomId: res.roomId,
      });

      if (find.length > 0) {
        if (msg) await message('直播间已经添加了!');
        return;
      }

      if (platform === Platform.Bili) {
        res.keyframe = IMAGE_PROXY + res.keyframe;
        res.face = IMAGE_PROXY + res.face;
      }
      curd.create(res);
      if (msg) await message('添加成功!');
    } catch (error) {
      console.log(error);
    }
  }

  async function update(roomId: number, platform: Platform, msg = true) {
    try {
      const res = await getRoomInfo(roomId, platform);
      if (res) {
        if (platform === Platform.Bili) {
          res.keyframe = IMAGE_PROXY + res.keyframe;
          res.face = IMAGE_PROXY + res.face;
        }
        curd.update(
          {
            roomId: res.roomId,
            platform: res.platform,
          },
          res,
        );
        if (msg) await message('更新成功!');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function remove(roomId: number, platform: Platform) {
    curd.remove({
      roomId,
      platform,
    });
    await message('更新成功!');
  }

  return { add, update, remove };
}
