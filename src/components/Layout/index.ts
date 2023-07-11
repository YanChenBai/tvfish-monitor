import layoutConfig from './config';
export const getPlayerCode = (key: number) => String.fromCharCode(97 + key);
const layout = layoutConfig.map((item) => {
  const num = Array.from(new Set(item.replace(/'|\n/g, '').split(' ')));
  const arr = item.split('\n');
  return {
    area: item,
    names: num,
    num: num.length,
    row: arr.length,
    col: arr[0].split(' ').length,
  };
});
export default layout;
