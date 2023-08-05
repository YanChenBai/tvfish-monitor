import { Ex_WebSocket_UnLogin } from '@/utils/douyuDanmu';
import { STT } from '@/utils/stt.js';
import { getStrMiddle } from '@/utils/douyuDanmu';
import { RoomStatus } from '@/types/player';
export interface DouyuDanmuHandles {
  // 普通弹幕
  onIncomeDanmu: { (msg: DouyuDanmu): void };
  onLiveEnd: { (msg: LiveStatusChange): void };
  onLiveStart: { (msg: LiveStatusChange): void };
}

export interface LiveStatusChange {
  roomId: number; // 房间ID
  endTime: string; // 下播时间
  status: RoomStatus.LIVE | RoomStatus.CLOSE; // 直播间状态
  code: string; // 类型?不知到干啥的
  changeCause: string; // 开关播原因
  changeCauseType: string; // 开关播原因类型
  notify: string; // 通知类型
}

export interface DouyuDanmu {
  nn: string; // 昵称
  avatar: string; // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
  lv: number; // 等级
  txt: string; // 弹幕内容
  color: string; // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
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

const colorList = [
  '#1e87f0',
  '#7ac84b',
  '#ff69b4',
  '#ff7f00',
  '#ff7f00',
  '#ff0000',
];

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
      const color = data.col ? colorList[data.col] : '#fff';
      const obj: DouyuDanmu = {
        nn: data.nn, // 昵称
        avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
        lv: data.level, // 等级
        txt: data.txt, // 弹幕内容
        color: color, // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
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
    } else if (msgType === 'rss') {
      const data = stt.deserialize(msg);
      console.log(data);

      const obj: LiveStatusChange = {
        roomId: Number(data.rid),
        endTime: data.endtime,
        status: data.ss === '0' ? RoomStatus.CLOSE : RoomStatus.LIVE,
        code: data.code,
        changeCause: data.rt,
        changeCauseType: data.rtv,
        notify: data.notify,
      };
      switch (obj.status) {
        case RoomStatus.CLOSE:
          handle.onLiveEnd(obj);
          break;
        case RoomStatus.LIVE:
          handle.onLiveStart(obj);
          break;
      }
    }
  };

  return {
    close,
  };
}
