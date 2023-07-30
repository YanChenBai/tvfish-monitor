// store删除改查

type KeyOfType<T> = { [P in keyof T]?: T[P] };

// 查询多个
export function storeQuery<T = any>(store: Array<T>, where: KeyOfType<T>) {
  return store.filter((item) => {
    let conform = true;
    for (const key in where) {
      conform = conform && item[key] === where[key];
    }
    return conform;
  });
}

// 查询一个
export function storeQueryOne<T = any>(store: Array<T>, where: KeyOfType<T>) {
  return store.find((item) => {
    let conform = true;
    for (const key in where) {
      conform = conform && item[key] === where[key];
    }
    return conform;
  });
}

// 查询一个的数组索引
export function storeQueryOneIndex<T = any>(
  store: Array<T>,
  where: KeyOfType<T>,
) {
  return store.findIndex((item) => {
    let conform = true;
    for (const key in where) {
      conform = conform && item[key] === where[key];
    }
    return conform;
  });
}

// 更新
export function storeUpdate<T>(
  store: Array<T>,
  where: KeyOfType<T>,
  update: KeyOfType<T>,
) {
  const index = storeQueryOneIndex<T>(store, where);
  if (index === -1) return;
  store[index] = { ...store[index], ...update };
  return store[index];
}

// 删除
export function storeRemove<T>(store: Array<T>, where: KeyOfType<T>) {
  const index = storeQueryOneIndex<T>(store, where);
  if (index === -1) return;
  return store.splice(index, 1);
}
