import { PlayerItem } from './../types/player';
import { getRoomInfo } from '@/api/getOrgin';
import { IMAGE_PROXY } from '@/config/proxy';
import { usePlayerStore } from '@/stores/playerStore';
import { Platform, RoomListItem } from '@/types/player';
import { message } from '@/utils/message';
import StoreQuery from '@/utils/storeQuey';
import { pinyin } from 'pinyin-pro';

function getPinYin(str: string[]): string[] {
  const pinyinList = [];

  for (let i = 0; i <= str.length; i++) {
    if (!str[i]) continue;
    const arr = pinyin(str[i], { toneType: 'none', type: 'array' });
    const omit = arr.map((item) => item.substring(0, 1));
    pinyinList.push(arr.join(''));
    pinyinList.push(omit.join(''));
  }
  return pinyinList;
}

export default function useRoomList() {
  const playerStore = usePlayerStore();
  const curd = new StoreQuery(playerStore.roomList);
  const topRoomCurd = new StoreQuery(playerStore.topRoomList);
  const pinyinListCurd = new StoreQuery(playerStore.pinyinList);

  function pinyinCreateOrUpdate(item: RoomListItem) {
    const pinyinList = getPinYin([item.name, item.tags]);
    const key = {
      roomId: item.roomId,
      platform: item.platform,
    };
    const find = pinyinListCurd.queryOne(key);
    if (find) {
      pinyinListCurd.update(key, {
        value: pinyinList,
      });
    } else {
      pinyinListCurd.create({
        ...key,
        value: pinyinList,
      });
    }
  }

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
      pinyinCreateOrUpdate(res);
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
        pinyinCreateOrUpdate(res);
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
    // 删除置顶
    const findTop = topRoomCurd.queryOne({ roomId, platform });
    if (findTop) topRoomCurd.remove(findTop);

    // 删除拼音数据
    const findPinyin = pinyinListCurd.queryOne({ roomId, platform });
    if (findPinyin) pinyinListCurd.remove(findPinyin);

    // 删除房间列表
    curd.remove({
      roomId,
      platform,
    });
    await message('更新成功!');
  }

  return { add, update, remove };
}
