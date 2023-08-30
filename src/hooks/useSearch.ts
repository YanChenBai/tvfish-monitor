import RoomStore from '@/stores/room';
import { Platform, RoomStatus } from '@/types/player';
import { drop, last } from 'lodash';

/** 规则 - start */
const platformRules = [
  [Platform.Bili, 'b站', '哔哩哔哩', '哔哩', 'bl', 'bili', 'bilibili'],
  [Platform.Douyu, '斗鱼', 'douyu', 'dy'],
];
const statusRules = [
  [RoomStatus.LIVE, 'live', '直播', '上班'],
  [RoomStatus.CLOSE, 'close', '下播', '下班'],
  [RoomStatus.REC, 'rec', '轮播', '录像'],
];
/** 规则 - end */

function matchRule(
  str: string,
  rules: Array<string | Platform | RoomStatus>[],
) {
  for (const index in rules) {
    const rule = drop(rules[index]);
    if (rule.indexOf(str) > -1) return rules[index][0];
  }
  return null;
}

function searchStatusAndPlatform(keyword: string, item: RoomStore) {
  const statusList = [
    matchRule(keyword, statusRules),
    matchRule(keyword, platformRules),
  ];
  if (statusList[0] !== null) return statusList[0] === item.status;
  if (statusList[1] !== null) return statusList[1] === item.platform;
  return null;
}

function searchAttr(attr: string[], keyword: string, like = true): boolean {
  if (attr.length === 0) return false;
  else {
    const item = attr.shift()!.toLocaleLowerCase();
    const find = like
      ? item.search(keyword.toLocaleLowerCase()) !== -1
      : item === keyword;
    if (find) {
      return true;
    } else {
      return find || searchAttr(attr, keyword, like);
    }
  }
}

function split(str: string, len = 2): string[] {
  len--;
  const index = str.indexOf(' ');
  if (index === -1 || len == 0) return [str];
  else {
    return [str.substring(0, index), ...split(str.substring(index + 1), len)];
  }
}

function res(status: boolean | null, val: boolean) {
  if (status === null) return val;
  else {
    return status && val;
  }
}

export function useSearch(searchWord: string, item: RoomStore) {
  const keys = split(searchWord.trim().toLocaleLowerCase());
  let status = null;
  let keyword = searchWord;
  const { length } = keys;
  if (length >= 1) {
    const tmp = searchStatusAndPlatform(keys[0], item);
    if (tmp !== null) status = res(status, tmp);
  }
  if (length >= 2) {
    const tmp = searchStatusAndPlatform(keys[1], item);
    if (tmp !== null) status = res(status, tmp);
    if (tmp) keyword = last(keys)!;
  }

  if (status !== null) return status;

  // 搜索属性
  const attr = [
    item.name,
    item.tags,
    item.title,
    item.news,
    item.roomId.toString(),
    item.shortId.toString(),
    ...item.tagsPinyin,
    ...item.namePinyin,
  ];

  return searchAttr(attr, keyword);
}
