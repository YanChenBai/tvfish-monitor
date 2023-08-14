import PlayerStore from '@/stores/player';
import { ComputedRef, InjectionKey, ReactiveEffect, Ref, reactive } from 'vue';
import { Item } from 'pinia-orm';
import { ConfigType } from './player';

export const playerWrapProvide = Symbol() as InjectionKey<{
  player: ComputedRef<Item<PlayerStore>>;
  config: {
    line: string | null;
    lines: string[];
    quality: string | null;
    qualitys: string[];
    type: ConfigType;
    url: string;
  };
}>;

export const playerProvide = Symbol() as InjectionKey<{
  refresh: { (): void };
  destroy: { (): void };
}>;
