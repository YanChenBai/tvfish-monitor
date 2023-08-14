import { Platform, RoomStatus } from '@/types/player';
import { Model } from 'pinia-orm';
import { Str, Num, Bool, Uid } from 'pinia-orm/dist/decorators';

export default class Room extends Model {
  static entity = 'room';
  static primaryKey = ['roomId', 'platform', 'roomTypeId'];

  @Uid()
  declare roomTypeId: string;

  @Num(0, { notNullable: true })
  declare roomId: number;

  @Str(Platform.Bili, { notNullable: true })
  declare platform: Platform;

  @Str('', { notNullable: true })
  declare name: string;

  @Str('', { notNullable: true })
  declare face: string;

  @Str('', { notNullable: true })
  declare title: string;

  @Str('', { notNullable: true })
  declare news: string;

  @Str('', { notNullable: true })
  declare keyframe: string;

  @Str('', { notNullable: true })
  declare status: RoomStatus;

  @Num(0, { notNullable: true })
  declare shortId: number;

  @Str('', { notNullable: true })
  declare tags: string;

  @Str('')
  declare tagsPinyin: string;

  @Str('')
  declare namePinyin: string;

  @Bool(false)
  declare isTop: string;

  static piniaOptions = {
    persist: true,
  };
}
