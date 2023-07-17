import { RoomListItem } from '@/types/player';
import { isPhone } from '@/utils/isMobile';
import axios from 'axios';
import { getLiveInfoAndroid, getRoomInfoAndroid } from '../../server-android';

// axios.defaults.baseURL = 'http://npm.bycrx.ltd:8100/';
axios.defaults.baseURL = 'http://localhost:9000/';
// axios.defaults.baseURL = 'http://192.168.3.67:8200/';

export async function getDouyuOrgin(
  roomId: number,
  qn: number | null,
  line: string | null,
): Promise<any> {
  try {
    if (isPhone()) return await getLiveInfoAndroid(roomId, 'douyu', qn, line);
    const res = await axios(
      `/getLiveInfo?roomId=${roomId}&type=douyu${qn ? '&qn=' + qn : ''}${
        line ? '&line=' + line : ''
      }`,
    );
    return res.data;
  } catch (error) {
    return false;
  }
}

export async function getBiliOrgin(
  roomId: number,
  qn: number | null,
  line: string | null,
): Promise<any> {
  try {
    if (isPhone()) return await getLiveInfoAndroid(roomId, 'bili', qn, line);
    const res = await axios(
      `/getLiveInfo?roomId=${roomId}&type=bili${qn ? '&qn=' + qn : ''}${
        line ? '&line=' + line : ''
      }`,
    );

    return res.data;
  } catch (error) {
    return false;
  }
}

export async function getRoomInfo(
  roomId: number,
  type: string,
): Promise<RoomListItem | false> {
  try {
    if (isPhone()) {
      const res: any = await getRoomInfoAndroid(roomId, type);
      return res.data;
    }
    const res = await axios(`/getRoomInfo?roomId=${roomId}&type=${type}`);
    return res.data.data;
  } catch (error) {
    return false;
  }
}
