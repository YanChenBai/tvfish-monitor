import PlayerStore from '@/stores/player';
import RoomStore from '@/stores/room';
import { ComputedRef, InjectionKey } from 'vue';
import { Repository } from 'pinia-orm';
import { LiveConfig, UsePlayer } from '@/types/player';

export const playerWrapProvides = Symbol() as InjectionKey<{
  playerConfig: ComputedRef<PlayerStore>;
  liveConfig: LiveConfig;
  update: { (): void };
  clearLiveConfig: { (): void };
}>;

export const playerProvides = Symbol() as InjectionKey<UsePlayer>;

export const repoProvides = Symbol() as InjectionKey<{
  roomRepo: Repository<RoomStore>;
  playerRepo: Repository<PlayerStore>;
}>;

export const menuProvides = Symbol() as InjectionKey<{
  openSetting: { (room: RoomStore): void };
  openTips: { (room: RoomStore): void };
}>;
