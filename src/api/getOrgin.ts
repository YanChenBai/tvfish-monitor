import axios from 'axios';
import { getLiveInfoAndroid, getRoomInfoAndroid } from '../../server-and';

axios.defaults.baseURL = 'http://npm.bycrx.ltd:8100/';
// axios.defaults.baseURL = 'http://localhost:9000/';

export async function getDouyuOrgin(
  roomId: number,
  qn: number | null,
  line: string | null,
): Promise<any> {
  try {
    if (import.meta.env.VITE_MODE_TYPE === 'PHONE')
      return await getLiveInfoAndroid(roomId, 'douyu', qn, line);
    const res = await axios(
      `/getLiveInfo?roomId=${roomId}&type=douyu&qn=${qn ? qn : ''}&line=${
        line ? line : ''
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
  line: number | null,
): Promise<any> {
  try {
    if (import.meta.env.VITE_MODE_TYPE === 'PHONE') {
      return await (getLiveInfoAndroid(roomId, 'bili', qn, line) as any).data
        .data;
    }
    const res = await axios(
      `/getLiveInfo?roomId=${roomId}&type=bili&qn=${qn ? qn : ''}&line=${
        line ? line : ''
      }`,
    );

    return res.data;
  } catch (error) {
    return false;
  }
}

interface RoomInfo {
  face: string;
  keyframe: string;
  live_status: number;
  name: string;
  news: string;
  room_id: string;
  short_id: string;
  title: string;
  uid: number;
}

export async function getRoomInfo(
  roomId: number,
  type: string,
): Promise<RoomInfo | false> {
  try {
    if (import.meta.env.VITE_MODE_TYPE === 'PHONE') {
      const res = (await getRoomInfoAndroid(roomId, type)) as any;
      alert(JSON.stringify(res));
      return res;
    }
    const res = await axios(`/getRoomInfo?roomId=${roomId}&type=${type}`);
    return res.data.data;
  } catch (error) {
    return false;
  }
}
