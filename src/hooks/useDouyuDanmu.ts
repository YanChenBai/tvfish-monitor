import { ref } from 'vue';
import { Ex_WebSocket_UnLogin } from '@/utils/douyuDanmu';
import { STT } from '@/utils/stt.js';
import { getStrMiddle } from '@/utils/douyuDanmu';
export interface DouyuDanmuHandles {
  // 普通弹幕
  onIncomeDanmu: { (msg: DouyuDanmu): void };
}
export interface DouyuDanmu {
  nn: string; // 昵称
  avatar: string; // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
  lv: number; // 等级
  txt: string; // 弹幕内容
  color: undefined | 2 | 3 | 6 | 4 | 5 | 1; // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
  fansName: string; // 粉丝牌名字
  fansLv: number; // 粉丝牌等级
  diamond: boolean; // 是否是钻粉
  noble: number; // 贵族等级
  nobleC: number; // 贵族弹幕是否开启，1开
  roomAdmin: number; // 房管，data.rg为4则是房管
  super: number; // 超管，data.pg为5则为超管
  vip: boolean; // vip，如果是 453/则为vip  454/则为超级vip
  key: number; // 时间戳
}
export function useDouyuDanmu(rid: number, handle: DouyuDanmuHandles) {
  const stt = new STT();

  let ws: Ex_WebSocket_UnLogin | null = new Ex_WebSocket_UnLogin(rid, (msg) => {
    handleMsg(msg);
  });

  function close() {
    if (ws !== null) {
      ws.close();
      ws = null;
    }
  }

  const handleMsg = (msg: string) => {
    const msgType = getStrMiddle(msg, 'type@=', '/');
    if (!msgType) {
      return;
    }
    if (msgType === 'chatmsg') {
      const data = stt.deserialize(msg);
      const obj: DouyuDanmu = {
        nn: data.nn, // 昵称
        avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
        lv: data.level, // 等级
        txt: data.txt, // 弹幕内容
        color: data.col, // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
        fansName: data.bnn, // 粉丝牌名字
        fansLv: data.bl, // 粉丝牌等级
        diamond: data.diaf, // 是否是钻粉
        noble: data.nl, // 贵族等级
        nobleC: data.nc, // 贵族弹幕是否开启，1开
        roomAdmin: data.rg, // 房管，data.rg为4则是房管
        super: data.pg, // 超管，data.pg为5则为超管
        vip: data.ail == '453/' || data.ail == '454/', // vip，如果是 453/则为vip  454/则为超级vip
        key: data.cid, // 时间戳
      };
      handle.onIncomeDanmu(obj);
    }
  };

  return {
    close,
  };
}
