import PlayerStore from '@/stores/player';
import { ComputedRef, InjectionKey, Ref } from 'vue';
import { Item } from 'pinia-orm';
import { ConfigType } from './player';

export const playerProvide = Symbol() as InjectionKey<
  ComputedRef<Item<PlayerStore>>
>;

export const liveConfigProvide = Symbol() as InjectionKey<{
  line: string | null;
  lines: string[];
  quality: string | null;
  qualitys: string[];
  type: ConfigType;
  url: string;
}>;
