// import { get } from './bili.info';
import { getLiveInfo } from './bili.live';
import { getUserInfo } from './bili.info';
import { getRealUrl } from './douyu.live';
import { getUserInfoDouyu } from './douyu.info';

export async function getLiveInfoAndroid(
  roomId: any,
  type: any,
  qn: any = null,
  line: any = null,
) {
  if (type === 'bili') {
    return await getLiveInfo(roomId, qn, line);
  } else if (type === 'douyu') {
    return await getRealUrl(roomId, qn, line);
  }
}

export async function getRoomInfoAndroid(roomId: any, type: any) {
  if (type === 'bili') {
    return await getUserInfo(roomId);
  } else if (type === 'douyu') {
    return await getUserInfoDouyu(roomId);
  }
}
