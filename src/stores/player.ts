import { Model } from 'pinia-orm';
import { Str, Num, Bool, Uid, HasOne } from 'pinia-orm/dist/decorators';
import Room from './room';

export default class PlayerStore extends Model {
  static entity = 'playerNew';
  static primaryKey = 'id';

  @Uid()
  declare id: number;

  @Num(0)
  declare volume: number;

  @Bool(false)
  declare danmu: boolean;

  @Str('')
  declare roomTypeId: string;

  @HasOne(() => Room, 'roomTypeId', 'roomTypeId')
  declare room: Room | null;

  static piniaOptions = {
    persist: true,
  };
}
