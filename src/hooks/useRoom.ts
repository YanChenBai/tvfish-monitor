import { Platform } from '@/types/player';
import RoomStore from '@/stores/room';
import { Repository } from 'pinia-orm';
import { getRoomInfo, getRoomInfoManyBili } from '@/api/getOrgin';
import { message } from '@/utils/message';
import { pinyin } from 'pinyin-pro';

function getPinYin(str: string): string[] {
  if (!str || str.length === 0) return [];
  const pinyinList = [];
  const arr = pinyin(str, {
    toneType: 'none',
    type: 'array',
    v: true,
    nonZh: 'removed',
  });
  const omit = arr.map((item) => item.substring(0, 1));
  pinyinList.push(arr.join(''));
  pinyinList.push(omit.join(''));
  return pinyinList;
}

export default function useRoom(roomRepo: Repository<RoomStore>) {
  async function add(roomId: number, platform: Platform, msg = true) {
    try {
      const res = await getRoomInfo(roomId, platform);
      if (res === false) return;
      const namePinyin = getPinYin(res.name);
      const tagsPinyin = getPinYin(res.tags);
      roomRepo.save({
        roomTypeId: `${res.platform}@${res.roomId}`,
        ...res,
        namePinyin,
        tagsPinyin,
      });
      if (msg) await message('添加成功!');
    } catch (error) {
      console.log(error);
    }
  }

  async function updateManyBili() {
    const data = roomRepo.where('platform', Platform.Bili).get();
    const uids = data.map((item) => item.uid);
    const res = await getRoomInfoManyBili(uids);

    if (res) {
      for (const roomId in res) {
        const roomTypeId = `${Platform.Bili}@${roomId}`;
        roomRepo.where('roomTypeId', roomTypeId).update(res[roomId]);
      }
    }
  }

  async function update(roomId: number, platform: Platform, msg = true) {
    try {
      const res = await getRoomInfo(roomId, platform);
      if (res === false) return;
      const namePinyin = getPinYin(res.name);
      const tagsPinyin = getPinYin(res.tags);
      const roomTypeId = `${res.platform}@${res.roomId}`;
      roomRepo.where('roomTypeId', roomTypeId).update({
        roomTypeId,
        ...res,
        namePinyin,
        tagsPinyin,
      });
      if (msg) await message('更新成功!');
    } catch (error) {
      console.log(error);
    }
  }

  async function remove(roomId: number, platform: Platform, msg = true) {
    try {
      const roomTypeId = `${platform}@${roomId}`;
      roomRepo.where('roomTypeId', roomTypeId).delete();
      if (msg) await message('删除成功!');
    } catch (error) {
      console.log(error);
    }
  }

  return { add, update, remove, updateManyBili };
}
