import axios from 'axios';

axios.defaults.baseURL = 'http://192.168.3.67:9889/';

export async function getDouyuOrgin(
  roomId: number,
  qn: number | null,
  line: string | null,
): Promise<any> {
  try {
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
    const res = await axios(
      `/getLiveInfo?roomId=${roomId}&type=bili&qn=${qn ? qn : ''}&line=${
        line ? line : ''
      }`,
    );
    console.log(res.data);

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
    const res = await axios(`/getRoomInfo?roomId=${roomId}&type=${type}`);
    return res.data.data;
  } catch (error) {
    return false;
  }
}
