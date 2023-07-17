import { RoomListItem } from '@/types/player';
import axios from 'axios';

axios.defaults.baseURL = 'http://npm.bycrx.ltd:8100/';
// axios.defaults.baseURL = 'http://localhost:9000/';

export async function getDouyuOrgin(
  roomId: number,
  qn: number | null,
  line: string | null,
): Promise<any> {
  try {
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
    const res = await axios(`/getRoomInfo?roomId=${roomId}&type=${type}`);
    return res.data.data;
  } catch (error) {
    return false;
  }
}
