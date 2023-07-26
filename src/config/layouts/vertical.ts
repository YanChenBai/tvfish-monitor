import { getPlayerCode } from '@/hooks/layout';

getPlayerCode;
const list: any[] = [];
for (let i = 1; i <= 8; i++) {
  const size: any = {};
  const layout = [];
  for (let key = 0; key < i; key++) {
    layout.push(getPlayerCode(key));
    size[getPlayerCode(key)] = [100 / i, 100];
  }
  list.push({
    size,
    layout: [layout],
  });
}
for (let i = 2; i <= 8; i++) {
  const size: any = {};
  const layout = [];
  for (let key = 0; key < i; key++) {
    layout.push([getPlayerCode(key)]);
    size[getPlayerCode(key)] = [100, 100 / i];
  }
  list.push({
    size,
    layout: layout,
  });
}

for (let i = 2; i <= 4; i++) {
  const size: any = {};
  const layout = [];
  let index = 0;
  for (let key = 0; key < i; key++) {
    const lastIndex = index + 1;
    layout.push([getPlayerCode(index), getPlayerCode(lastIndex)]);
    size[getPlayerCode(index)] = [50, 100 / i];
    size[getPlayerCode(lastIndex)] = [50, 100 / i];
    index += 2;
  }
  list.push({
    size,
    layout: layout,
  });
}
export default list;
