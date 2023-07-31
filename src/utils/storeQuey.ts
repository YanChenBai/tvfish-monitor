// store删除改查
type KeyOfType<T> = { [P in keyof T]?: T[P] };

export default class StoreQuery<T> {
  store: T[] = [];
  constructor(data: T[]) {
    this.store = data;
  }

  // 查询一个的数组索引
  queryOneIndex(where: KeyOfType<T>) {
    return this.store.findIndex((item) => {
      let conform = true;
      for (const key in where) {
        conform = conform && item[key] === where[key];
      }
      return conform;
    });
  }

  // 添加
  create(item: T) {
    this.store.push(item);
  }

  // 删除
  remove(where: KeyOfType<T>) {
    const index = this.queryOneIndex(where);
    if (index === -1) return;
    return this.store.splice(index, 1);
  }

  // 更新
  update(where: KeyOfType<T>, update: KeyOfType<T>) {
    const index = this.queryOneIndex(where);
    if (index === -1) return;
    this.store[index] = { ...this.store[index], ...update };
    return this.store[index];
  }

  // 查询一个
  queryOne(where: KeyOfType<T>) {
    const queryIndex = this.queryOneIndex(where);
    return queryIndex === -1 ? null : this.store[queryIndex];
  }

  // 查询多个
  queryAll(where: KeyOfType<T>) {
    return this.store.filter((item) => {
      let conform = true;
      for (const key in where) {
        conform = conform && item[key] === where[key];
      }
      return conform;
    });
  }
}
