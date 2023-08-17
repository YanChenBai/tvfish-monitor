export function updateAttr<T>(orgin: T, update: T): T {
  for (const key in orgin) {
    orgin[key] = update[key];
  }
  return orgin;
}
