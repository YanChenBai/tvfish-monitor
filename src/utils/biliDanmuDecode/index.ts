import { LiveWS } from 'bilibili-live-ws/browser';
import {
  SUPER_CHAT_MESSAGE,
  SuperChatMsg,
  DANMU_MSG,
  DanmuMsg,
} from './parser/index';

interface Handler {
  onIncomeDanmu?: { (msg: DanmuMsg): void };
  onIncomeSuperChat?: { (msg: SuperChatMsg): void };
  onLiveStart?: { (): void };
  onLiveEnd?: { (): void };
}

export function startListen(id: number, handler: Handler) {
  const live = new LiveWS(id, { protover: 3 });
  live.on('DANMU_MSG', (data: any) => {
    handler.onIncomeDanmu && handler.onIncomeDanmu(DANMU_MSG.parser(data, id));
  });

  live.on(
    'SUPER_CHAT_MESSAGE',
    (data: any) =>
      handler.onIncomeSuperChat &&
      handler.onIncomeSuperChat(SUPER_CHAT_MESSAGE.parser(data, id)),
  );

  live.on('LIVE', () => handler.onLiveStart && handler.onLiveStart());
  live.on('PREPARING', () => handler.onLiveEnd && handler.onLiveEnd());

  return {
    close: () => live.close(),
  };
}
