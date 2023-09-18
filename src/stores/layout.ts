import { Model } from 'pinia-orm';
import { Num, Uid } from 'pinia-orm/dist/decorators';

export default class LayoutStore extends Model {
  static entity = 'layout';
  static primaryKey = 'id';

  @Uid()
  declare id: number;

  @Num(0)
  declare x: number;

  @Num(0)
  declare y: number;

  @Num(0)
  declare w: number;

  @Num(0)
  declare h: number;

  static piniaOptions = {
    persist: true,
  };
}
