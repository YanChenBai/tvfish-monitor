import PlayerStore from '@/stores/player';
import RoomStore from '@/stores/room';
import { ComputedRef, InjectionKey, Ref, reactive } from 'vue';
import { Repository } from 'pinia-orm';
import { LiveConfig, UsePlayer } from '@/types/playerNew';

export const playerWrapProvide = Symbol() as InjectionKey<{
  playerConfig: ComputedRef<PlayerStore>;
  liveConfig: LiveConfig;
}>;

export const playerProvide = Symbol() as InjectionKey<UsePlayer>;

export const repoProvides = Symbol() as InjectionKey<{
  roomRepo: Repository<RoomStore>;
  playerRepo: Repository<PlayerStore>;
}>;

export const menuProvides = Symbol() as InjectionKey<{
  openSetting: { (room: RoomStore): void };
  openTips: { (room: RoomStore): void };
}>;
