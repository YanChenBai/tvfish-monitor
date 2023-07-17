// import { get } from './bili.info';
import { getLiveInfoBili } from './bili.live';
import { getUserInfoBili } from './bili.info';
import { getLiveInfoDouyu } from './douyu.live';
import { getUserInfoDouyu } from './douyu.info';

export async function getLiveInfoAndroid(
  roomId: any,
  type: any,
  qn: any = null,
  line: any = null,
) {
  if (type === 'bili') {
    return await getLiveInfoBili(roomId, qn, line);
  } else if (type === 'douyu') {
    return await getLiveInfoDouyu(roomId, qn, line);
  }
}

export async function getRoomInfoAndroid(roomId: any, type: any) {
  if (type === 'bili') {
    return await getUserInfoBili(roomId);
  } else if (type === 'douyu') {
    return await getUserInfoDouyu(roomId);
  }
}
